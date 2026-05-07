// ─────────────────────────────────────────────
// LAYER 2 — ENHANCED RECIPE META
// Rules for filling enhanced schema fields
// ─────────────────────────────────────────────

export const RECIPE_META_ENHANCED = {
  fields: {
    // Existing fields (no changes)
    id: {
      fillable: false,
      description: 'Generated recipe ID',
    },
    recipe_name: {
      fillable: true,
      description: 'Recipe name in Hebrew or English',
    },
    description: {
      fillable: true,
      description: 'Short description of the dish',
    },
    recipe_type: {
      fillable: false,
      description: 'Type of recipe (food/smoothie/cocktail)',
    },
    active_section: {
      fillable: false,
      description: 'Active section for this recipe type',
    },
    override_reason: {
      fillable: true,
      description: 'Why this recipe overrides default behavior',
    },
    difficulty: {
      fillable: true,
      description: 'Difficulty level: easy, medium, hard',
    },
    estimated_time_minutes: {
      fillable: true,
      description: 'Total cooking time in minutes',
    },

    // Enhanced: Ingredients with categories
    ingredients: {
      fillable: true,
      description: 'List of ingredients used',
      subFields: {
        name: 'Ingredient name (Hebrew)',
        quantity: 'Amount (e.g., 2, 100)',
        unit: 'Unit of measurement (g, ml, cup, tsp, tbsp)',
        category: 'Category: spice, vegetable, fruit, herb, protein, dairy, other',
        is_missing: 'true if ingredient not available, user will substitute',
      },
    },

    missing_ingredients: {
      fillable: true,
      description: 'Ingredients the user lacks, with substitution suggestions',
      subFields: {
        items: 'List of missing ingredients',
        count: 'Number of missing ingredients',
      },
    },

    // Enhanced: Dietary type
    dietary_type: {
      fillable: true,
      description: 'Dietary classification: omnivore, vegetarian, vegan, pescatarian, kosher, halal, dairy-free, gluten-free',
    },

    dietary_notes: {
      fillable: true,
      description: 'Special notes about dietary compliance or restrictions',
    },

    // Steps with time tracking
    steps: {
      fillable: true,
      description: 'Cooking instructions',
      subFields: {
        order: 'Step number (1, 2, 3...)',
        instruction: 'Hebrew cooking instruction',
        duration_seconds: 'How long this step takes (optional)',
      },
    },

    // Enhanced serving info
    serving: {
      fillable: true,
      activeFor: ['food'],
      description: 'Serving information',
      subFields: {
        size: 'Number of servings',
        unit: 'Unit (people, cups, portions)',
        temperature: 'Serving temperature (hot, cold, room)',
        style: 'Serving style (on plate, in bowl, etc.)',
      },
    },

    // Drink-specific
    drink: {
      fillable: true,
      activeFor: ['cocktail'],
      description: 'Drink-specific information',
      subFields: {
        glass_type: 'Type of glass (martini, highball, rocks, etc.)',
        garnish: 'Garnish suggestion',
        is_alcoholic: 'true if contains alcohol',
        serve_method: 'How to serve (shaken, stirred, neat, etc.)',
      },
    },

    // Smoothie-specific
    smoothie: {
      fillable: true,
      activeFor: ['smoothie'],
      description: 'Smoothie-specific information',
      subFields: {
        blend_time_seconds: 'Blending duration in seconds',
        texture: 'Desired texture (creamy, chunky, smooth, etc.)',
      },
    },

    // Nutrition facts
    nutrition: {
      fillable: true,
      description: 'Nutritional information per serving',
      subFields: {
        calories_per_serving: 'Calories (approximate)',
        protein_g: 'Protein in grams',
        carbs_g: 'Carbohydrates in grams',
        fat_g: 'Fat in grams',
        fiber_g: 'Dietary fiber in grams',
      },
    },

    // Tips
    tips: {
      fillable: true,
      description: 'Helpful tips for making this recipe',
    },

    // Substitutions
    substitutions: {
      fillable: true,
      description: 'Ingredient substitution suggestions',
      subFields: {
        original: 'Original ingredient',
        substitute: 'Replacement ingredient',
        reason: 'Why use this substitute (allergy, dietary, taste)',
      },
    },

    // Allergens
    allergens: {
      fillable: true,
      description: 'List of allergens present in recipe: חלב, ביצים, דגים, חרוצים, אגוז, ככליות, חרדל, שומשום, קמח, סויה',
    },
  },

  rules: {
    // When dietary_type is specified, ensure ingredients match
    dietary_compliance: {
      description: 'All ingredients MUST match the dietary_type restrictions',
      examples: [
        'If dietary_type=vegan: no dairy, eggs, meat, honey',
        'If dietary_type=vegetarian: no meat but dairy/eggs ok',
        'If dietary_type=kosher: no pork, shellfish, rabbit',
      ],
    },

    // Ingredient categorization
    categorization: {
      description: 'Categorize each ingredient: spice, herb, vegetable, fruit, protein, dairy, other',
      importance: 'HIGH - helps user understand ingredient types',
    },

    // Missing ingredients handling
    missing_handling: {
      description: 'If user lacks ingredient, suggest substitutions from COMMON_SUBSTITUTIONS',
      example: 'User lacks eggs → suggest: קמח כתנה, בננה (for vegan)',
    },

    // Allergen detection
    allergen_detection: {
      description: 'If recipe contains known allergens, list them',
      examples: [
        'Milk in recipe → add "חלב" to allergens',
        'Peanuts → add "אגוז" to allergens',
      ],
    },

    // Time estimation
    time_estimation: {
      description: 'Sum all step.duration_seconds and convert to minutes',
      rule: 'estimated_time_minutes = sum of all step times / 60',
    },
  },
};

// Helper: Get dietary restrictions for type
export function getDietaryRestrictions(dietaryType: string): string[] {
  const restrictions: Record<string, string[]> = {
    omnivore: [],
    vegetarian: ['beef', 'chicken', 'fish', 'shellfish', 'meat'],
    vegan: ['beef', 'chicken', 'fish', 'meat', 'dairy', 'eggs', 'honey', 'milk'],
    pescatarian: ['beef', 'chicken', 'pork', 'meat'],
    kosher: ['shellfish', 'pork', 'rabbit'],
    halal: ['pork', 'shellfish'],
    'dairy-free': ['dairy', 'milk', 'cheese', 'cream', 'butter'],
    'gluten-free': ['wheat', 'barley', 'gluten'],
  };
  return restrictions[dietaryType] || [];
}
