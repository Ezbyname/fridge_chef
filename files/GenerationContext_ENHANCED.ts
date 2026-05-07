// ─────────────────────────────────────────────
// ENHANCED GENERATION CONTEXT
// Now includes dietary preferences and constraints
// ─────────────────────────────────────────────

import { RecipeType, DietaryType } from './RECIPE_SCHEMA_ENHANCED';

export interface IngredientSuggestion {
  name: string;
  confidence: number;
  fromCamera: boolean;
  imageUri?: string;
}

export interface GenerationFilters {
  cuisine: string;
  taste: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  missingLimit: number;
  allowAlcohol: boolean;
  // NEW: Dietary preferences
  dietaryType?: DietaryType;
  allergyExclusions?: string[];  // ['חלב', 'ביצים', etc.]
  preferredCategories?: string[];  // ['spice', 'herb', 'vegetable', etc.]
}

export interface GenerationContext {
  // What kind of recipe
  recipeType: RecipeType;

  // Ingredients — unified from both manual + camera
  ingredientsHave: IngredientSuggestion[];
  ingredientsAvoid: string[];

  // Filters
  filters: GenerationFilters;

  // Snapshot of camera image (for display, not sent to API)
  cameraImageUri?: string;
}

export const DEFAULT_FILTERS: GenerationFilters = {
  cuisine: 'any',
  taste: 'any',
  difficulty: 'easy',
  timeLimit: 30,
  missingLimit: 3,
  allowAlcohol: true,
  dietaryType: 'omnivore',
  allergyExclusions: [],
  preferredCategories: [],
};

export function emptyContext(recipeType: RecipeType = 'food'): GenerationContext {
  return {
    recipeType,
    ingredientsHave: [],
    ingredientsAvoid: [],
    filters: { ...DEFAULT_FILTERS },
  };
}

// Adapter: GenerationContext → generateRecipe() params
import { GenerationContext as EngineContext } from './generateRecipe';

export function toEngineContext(ctx: GenerationContext): EngineContext {
  return {
    recipe_type: ctx.recipeType,
    ingredients_have: ctx.ingredientsHave.map(i => i.name),
    ingredients_avoid: ctx.ingredientsAvoid,
    missing_limit: ctx.filters.missingLimit,
    taste: ctx.filters.taste,
    cuisine: ctx.filters.cuisine,
    time_limit: ctx.filters.timeLimit,
    difficulty: ctx.filters.difficulty,
    allow_alcohol: ctx.filters.allowAlcohol,
    // NEW: Dietary preferences
    dietary_type: ctx.filters.dietaryType,
    allergy_exclusions: ctx.filters.allergyExclusions,
    preferred_categories: ctx.filters.preferredCategories,
  };
}

// Helper: Check if ingredient matches dietary restrictions
export function ingredientMatchesDietary(
  ingredientName: string,
  dietaryType?: DietaryType,
  allergyExclusions?: string[]
): boolean {
  if (!dietaryType && !allergyExclusions) return true;

  // Check allergies first
  if (allergyExclusions?.length) {
    const lowerName = ingredientName.toLowerCase();
    if (allergyExclusions.some(a => lowerName.includes(a.toLowerCase()))) {
      return false;
    }
  }

  // Check dietary restrictions
  if (dietaryType) {
    const restrictions: Record<string, string[]> = {
      omnivore: [],
      vegetarian: ['בשר', 'עוף', 'דגים', 'חרוצים'],
      vegan: ['בשר', 'עוף', 'דגים', 'חלב', 'ביצים', 'דבש'],
      pescatarian: ['בשר', 'עוף', 'חזיר'],
      kosher: ['חזיר', 'חרוצים', 'ארנב'],
      halal: ['חזיר', 'חרוצים'],
      'dairy-free': ['חלב', 'גבינה', 'קרם', 'חמאה'],
      'gluten-free': ['חיטה', 'שיפון', 'גלוטן'],
    };

    const restricted = restrictions[dietaryType] || [];
    const lowerName = ingredientName.toLowerCase();
    
    if (restricted.some(r => lowerName.includes(r.toLowerCase()))) {
      return false;
    }
  }

  return true;
}

// Helper: Suggest substitutions based on dietary needs
export function suggestSubstitution(
  originalIngredient: string,
  dietaryType?: DietaryType
): Array<{ substitute: string; reason: string }> {
  const substitutions: Record<string, Array<{ substitute: string; reason: string }>> = {
    חלב: [
      { substitute: 'חלב קוקוס', reason: 'טבעוני, ללא חלבי' },
      { substitute: 'חלב שקדים', reason: 'טבעוני, ללא חלבי' },
      { substitute: 'חלב אורז', reason: 'ללא חלבי' },
    ],
    חמאה: [
      { substitute: 'שמן זית', reason: 'בריאות, ללא חלבי' },
      { substitute: 'שמן קוקוס', reason: 'טבעוני' },
      { substitute: 'אבוקדו', reason: 'טבעוני, בריא' },
    ],
    ביצים: [
      { substitute: 'קמח כתנה + מים', reason: 'טבעוני' },
      { substitute: 'בננה으', reason: 'טבעוני' },
      { substitute: 'תמרציק', reason: 'טבעוני' },
    ],
    עוף: [
      { substitute: 'טוקנו', reason: 'צמחוני' },
      { substitute: 'טפו', reason: 'טבעוני' },
      { substitute: 'עדשים', reason: 'צמחוני, חלבון' },
    ],
    בשר: [
      { substitute: 'דגים', reason: 'צמחוני, בשר לבן' },
      { substitute: 'טוקנו', reason: 'צמחוני' },
      { substitute: 'עדשים + קטניות', reason: 'טבעוני, חלבון' },
    ],
    דגים: [
      { substitute: 'עוף', reason: 'בשר לבן' },
      { substitute: 'טוקנו', reason: 'צמחוני' },
    ],
    חיטה: [
      { substitute: 'קמח שיבולת שועל', reason: 'ללא גלוטן' },
      { substitute: 'קמח אורז', reason: 'ללא גלוטן' },
      { substitute: 'קמח שקדים', reason: 'ללא גלוטן' },
    ],
  };

  const lowerIngredient = originalIngredient.toLowerCase();
  const key = Object.keys(substitutions).find(k => k.toLowerCase() === lowerIngredient);
  
  return key ? substitutions[key] : [];
}
