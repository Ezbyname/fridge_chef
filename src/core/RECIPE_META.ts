// ─────────────────────────────────────────────
// LAYER 2 — RECIPE_META (Generation Rules)
// Defines HOW fields are filled.
// Completely decoupled from RECIPE_SCHEMA shape.
// ─────────────────────────────────────────────

export const RECIPE_META = {
  fields: {
    id:              { fillable: false },
    recipe_type:     { fillable: false },
    active_section:  { fillable: false },
    override_reason: {
      fillable: true,
      description: 'Null unless active_section was changed from input. If changed: one sentence only.',
    },
    recipe_name: {
      fillable: true,
      description: 'Short, appetizing recipe name. Max 6 words.',
    },
    description: {
      fillable: true,
      description: '1-2 sentence description. Evocative, not clinical.',
    },
    estimated_time_minutes: {
      fillable:  true,
      activeFor: ['food', 'smoothie'],
      description: 'Realistic total time in minutes.',
    },
    difficulty: {
      fillable:  true,
      activeFor: ['food'],
      description: 'easy | medium | hard',
    },
    ingredients: {
      fillable: true,
      description: 'Array of { name, amount, is_missing }. Use ingredients_have as base. Mark added items is_missing: true. Max missing_limit extras.',
    },
    steps: {
      fillable: true,
      description: 'Ordered array of clear, short action steps. Minimum 2.',
    },
    tips: {
      fillable: true,
      description: 'Optional serving or prep tips. Can be empty array.',
    },
    serving: {
      fillable:  true,
      activeFor: ['food'],
      subFields: {
        temperature: 'hot | warm | cold | room temp',
        style:       'e.g. plated, family-style, in bowl',
      },
    },
    drink: {
      fillable:  true,
      activeFor: ['drink'],
      subFields: {
        glass_type:   'e.g. rocks glass, highball, coupe, martini glass',
        garnish:      'e.g. lime wedge, mint sprig, twist — null if none',
        is_alcoholic: 'boolean — MUST be false if allow_alcohol = false',
        serve_method: 'shaken | stirred | built | blended',
      },
    },
    smoothie: {
      fillable:  true,
      activeFor: ['smoothie'],
      subFields: {
        blend_time_seconds: 'integer seconds, typically 30–60',
        texture:            'smooth | chunky | creamy | icy',
      },
    },
  },
} as const;
