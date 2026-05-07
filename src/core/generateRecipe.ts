// ─────────────────────────────────────────────
// LAYER 3 — RUNTIME ENGINE
// API key read from expo-constants (via app.config.js + .env).
// Never hardcoded.
// ─────────────────────────────────────────────

import Constants from 'expo-constants';
import { RECIPE_SCHEMA, ACTIVE_SECTION_MAP, Recipe, RecipeType, RecipeMode, ActiveSection } from './RECIPE_SCHEMA';
import { RECIPE_META } from './RECIPE_META';

function getApiKey(): string {
  const key = Constants.expoConfig?.extra?.anthropicApiKey;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set. Add it to .env and app.config.js.');
  return key;
}

export interface GenerationContext {
  recipe_type:       RecipeType;
  ingredients_have:  string[];
  ingredients_avoid: string[];
  missing_limit:     number;
  taste:             string;
  cuisine:           string;
  time_limit:        number;
  difficulty:        string;
  allow_alcohol:     boolean;
}

function generateId(): string {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function flatten(obj: any, prefix = '', acc: Record<string, any> = {}): Record<string, any> {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      flatten(v, key, acc);
    } else {
      acc[key] = v;
    }
  }
  return acc;
}

function generateSkeletonFromSchema(
  schema: typeof RECIPE_SCHEMA,
  context: { id: string; recipe_type: RecipeType; active_section: ActiveSection }
): typeof RECIPE_SCHEMA {
  const clone = JSON.parse(JSON.stringify(schema));
  clone.id             = context.id;
  clone.recipe_type    = context.recipe_type;
  clone.active_section = context.active_section;
  return clone;
}

function sanitizeForAI(schema: any): any {
  return JSON.parse(JSON.stringify(schema));
}

function validateStrict(input: any, output: any): void {
  const inKeys  = Object.keys(flatten(input)).sort().join(',');
  const outKeys = Object.keys(flatten(output)).sort().join(',');
  if (inKeys !== outKeys) {
    throw new Error(`Schema drift detected.\nExpected: ${inKeys}\nGot: ${outKeys}`);
  }
}

function buildPromptTemplate(): string {
  return `You are a STRICT deterministic slot-filling engine.
You operate inside a schema-driven compiler system.
You receive 3 inputs: skeleton JSON, meta rules, and decision context.
CORE PRINCIPLE: schema=STRUCTURE, meta=RULES, decision=ACTIVE CONTEXT.

INPUT:
{{slot_json}}

{{meta_rules}}

{{decision_context}}

RULES:
1. STRUCTURE LOCK — No key changes. Return identical structure.
2. VALUE FILLING ONLY — Replace null values only.
3. DECISION ENFORCEMENT — Fill ONLY active_section fields. All others remain null.
4. OUTPUT FORMAT — Valid JSON only. No markdown. No explanation.
SELF-CORRECTION: verify structure unchanged, only nulls filled, no schema drift. Fix before responding.`;
}

function renderMetaRules(activeSection: ActiveSection): string {
  const fillable: string[] = [];
  const locked: string[]   = [];
  const lines: string[]    = ['[META RULES]'];

  for (const [key, field] of Object.entries(RECIPE_META.fields)) {
    if (!field.fillable) continue;
    const restricted = 'activeFor' in field && field.activeFor && !field.activeFor.includes(activeSection as never);
    if (restricted) {
      locked.push(key);
    } else {
      fillable.push(key);
      if ('description' in field && field.description) lines.push(`  ${key}: ${field.description}`);
      if ('subFields' in field && field.subFields) {
        for (const [sf, desc] of Object.entries(field.subFields)) {
          lines.push(`    ${key}.${sf}: ${desc}`);
        }
      }
    }
  }

  lines.push(`FILL: ${fillable.join(', ')}`);
  lines.push(`NULL: ${locked.join(', ')}`);
  return lines.join('\n');
}

function renderDecisionContext(activeSection: ActiveSection, metaContext: object): string {
  return `[DECISION — READ-ONLY]\nactive_section: ${activeSection}\n${JSON.stringify(metaContext, null, 2)}`;
}

async function safeGenerate(
  context: GenerationContext,
  mode: RecipeMode,
  lastRecipe: Recipe | null,
  callAI: (prompt: string, previousRaw?: string) => Promise<string>
): Promise<Recipe> {
  const recipeId      = generateId();
  const activeSection = ACTIVE_SECTION_MAP[context.recipe_type];

  const modeBlock = {
    new:       { action: 'new' },
    different: { action: 'different', last_recipe_name: lastRecipe?.recipe_name ?? null, instruction: 'Change ingredients, method, and structure significantly.' },
    similar:   { action: 'similar',   last_recipe_name: lastRecipe?.recipe_name ?? null, instruction: 'Keep core idea, minor variations only.' },
    simplify:  { action: 'simplify',  last_recipe_name: lastRecipe?.recipe_name ?? null, last_steps: lastRecipe?.steps ?? [], instruction: 'Fewer ingredients, fewer steps, simpler technique.' },
  }[mode] ?? { action: 'new' };

  const metaContext = {
    ingredients_have:  context.ingredients_have,
    ingredients_avoid: context.ingredients_avoid,
    missing_limit:     context.missing_limit,
    taste:             context.taste,
    allow_alcohol:     context.allow_alcohol,
    mode:              modeBlock,
    ...(context.recipe_type !== 'smoothie' && { cuisine: context.cuisine }),
    ...(context.recipe_type === 'food'     && { time_limit: context.time_limit, difficulty: context.difficulty }),
  };

  const skeleton      = generateSkeletonFromSchema(RECIPE_SCHEMA, { id: recipeId, recipe_type: context.recipe_type, active_section: activeSection });
  const sanitized     = sanitizeForAI(skeleton);
  const metaRules     = renderMetaRules(activeSection);
  const decisionBlock = renderDecisionContext(activeSection, metaContext);

  const prompt = buildPromptTemplate()
    .replace('{{slot_json}}',        JSON.stringify(sanitized, null, 2))
    .replace('{{meta_rules}}',       metaRules)
    .replace('{{decision_context}}', decisionBlock);

  const parseAndValidate = (raw: string): Recipe => {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed  = JSON.parse(cleaned);
    validateStrict(sanitized, parsed);
    return parsed as Recipe;
  };

  const raw = await callAI(prompt);
  try {
    return parseAndValidate(raw);
  } catch {
    const raw2 = await callAI(prompt, raw);
    return parseAndValidate(raw2);
  }
}

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

export async function generateRecipe(
  context: GenerationContext,
  mode: RecipeMode,
  lastRecipe: Recipe | null
): Promise<Recipe> {
  const apiKey = getApiKey();

  const callAI = async (prompt: string, previousRaw?: string): Promise<string> => {
    const messages = previousRaw
      ? [
          { role: 'user',      content: prompt },
          { role: 'assistant', content: previousRaw },
          { role: 'user',      content: 'Invalid JSON or schema drift. Return ONLY the raw JSON with identical structure.' },
        ]
      : [{ role: 'user', content: prompt }];

    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1200, messages }),
    });

    if (!res.ok) throw new Error(`API error ${res.status}`);
    const data = await res.json();
    return data.content?.find((b: any) => b.type === 'text')?.text ?? '';
  };

  return safeGenerate(context, mode, lastRecipe, callAI);
}
