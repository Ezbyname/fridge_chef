// ─────────────────────────────────────────────
// LAYER 1 — ENHANCED RECIPE SCHEMA
// Added: dietary types, missing ingredients tracking
// ─────────────────────────────────────────────

export type RecipeType = 'food' | 'smoothie' | 'cocktail';
export type RecipeMode = 'new' | 'different' | 'similar' | 'simplify';
export type ActiveSection = 'food' | 'smoothie' | 'drink';

// Dietary categories
export type DietaryType = 
  | 'omnivore'      // בשרי - all food
  | 'vegetarian'    // צמחוני - no meat
  | 'vegan'         // טבעוני - no animal products
  | 'pescatarian'   // דגים + חלבי
  | 'kosher'        // כשר
  | 'halal'         // חלאל
  | 'dairy-free'    // ללא חלבי
  | 'gluten-free';  // ללא גלוטן

export interface IngredientItem {
  name: string;
  quantity?: number;
  unit?: string;  // g, ml, cup, tsp, tbsp, etc.
  is_missing?: boolean;
  category?: 'spice' | 'vegetable' | 'fruit' | 'herb' | 'protein' | 'dairy' | 'other';
}

export interface RecipeStep {
  order: number;
  instruction: string;
  duration_seconds?: number;  // cooking/prep time for this step
}

export interface Recipe {
  id: string;
  recipe_type: RecipeType;
  recipe_name: string;
  description: string;
  active_section: ActiveSection;
  override_reason?: string;

  // Ingredients with metadata
  ingredients: IngredientItem[];
  missing_ingredients?: {
    items: IngredientItem[];
    count: number;
  };

  // Steps
  steps: RecipeStep[];

  // Dietary information
  dietary_type?: DietaryType;
  dietary_notes?: string;

  // Enhanced serving info
  serving?: {
    size?: number;
    unit?: string;  // people, cups, portions
    temperature?: string;
    style?: string;
  };

  // Drink-specific
  drink?: {
    glass_type?: string;
    garnish?: string;
    is_alcoholic?: boolean;
    serve_method?: string;
  };

  // Smoothie-specific
  smoothie?: {
    blend_time_seconds?: number;
    texture?: string;
  };

  // Nutritional info (optional)
  nutrition?: {
    calories_per_serving?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
  };

  // Tips and suggestions
  tips?: string[];
  substitutions?: Array<{
    original: string;
    substitute: string;
    reason?: string;
  }>;

  // Time estimation
  estimated_time_minutes?: number;
  difficulty?: 'easy' | 'medium' | 'hard';

  // Allergy warnings
  allergens?: string[];  // ['nuts', 'dairy', 'gluten', 'shellfish', etc.]
}

// Default schema structure
export const RECIPE_SCHEMA: Recipe = {
  id: null as any,
  recipe_type: null as any,
  recipe_name: null as any,
  description: null as any,
  active_section: null as any,
  override_reason: undefined,

  ingredients: [],
  missing_ingredients: undefined,

  steps: [],

  dietary_type: undefined,
  dietary_notes: undefined,

  serving: {
    size: undefined,
    unit: undefined,
    temperature: undefined,
    style: undefined,
  },

  drink: {
    glass_type: undefined,
    garnish: undefined,
    is_alcoholic: undefined,
    serve_method: undefined,
  },

  smoothie: {
    blend_time_seconds: undefined,
    texture: undefined,
  },

  nutrition: undefined,

  tips: [],
  substitutions: undefined,

  estimated_time_minutes: null as any,
  difficulty: null as any,

  allergens: undefined,
};

export const ACTIVE_SECTION_MAP: Record<RecipeType, ActiveSection> = {
  food: 'food',
  smoothie: 'smoothie',
  cocktail: 'drink',
};

// Ingredient categories for better organization
export const INGREDIENT_CATEGORIES = {
  spice: {
    label: 'תבלינים',
    emoji: '🌶️',
    examples: ['שום', 'פלפל', 'מלח', 'עלי דפנה', 'כורכום'],
  },
  herb: {
    label: 'עשבים',
    emoji: '🌿',
    examples: ['פטרוזיליה', 'כוסברה', 'בזיליקום', 'נענע'],
  },
  vegetable: {
    label: 'ירקות',
    emoji: '🥕',
    examples: ['עגבניה', 'חצילון', 'בצל', 'קרוט', 'סלרי'],
  },
  fruit: {
    label: 'פירות',
    emoji: '🍎',
    examples: ['תפוח', 'תותה', 'בננה', 'לימון'],
  },
  protein: {
    label: 'חלבונים',
    emoji: '🥚',
    examples: ['עוף', 'בשר', 'דגים', 'ביצים', 'טוקנו'],
  },
  dairy: {
    label: 'חלביים',
    emoji: '🧀',
    examples: ['גבינה', 'חלב', 'יוגורט', 'קרם'],
  },
  other: {
    label: 'אחרים',
    emoji: '🍯',
    examples: ['שמן', 'דבש', 'סוכר', 'קמח'],
  },
};

// Dietary type definitions
export const DIETARY_TYPES = {
  omnivore: {
    label: 'בשרי',
    emoji: '🍖️',
    description: 'כל מיני אוכל',
    restrictions: [],
  },
  vegetarian: {
    label: 'צמחוני',
    emoji: '🥗',
    description: 'ללא בשר, כן לחלביים',
    restrictions: ['beef', 'chicken', 'fish', 'shellfish', 'meat'],
  },
  vegan: {
    label: 'טבעוני',
    emoji: '🌱',
    description: 'ללא בשר ולא חלביים',
    restrictions: ['beef', 'chicken', 'fish', 'meat', 'dairy', 'eggs', 'honey'],
  },
  pescatarian: {
    label: 'דגים וחלבי',
    emoji: '🐟',
    description: 'דגים כן, בשר אדום לא',
    restrictions: ['beef', 'chicken', 'pork', 'meat'],
  },
  kosher: {
    label: 'כשר',
    emoji: '✡️',
    description: 'כשר לפסח או לשנה',
    restrictions: ['shellfish', 'pork', 'rabbit'],
  },
  halal: {
    label: 'חלאל',
    emoji: '☪️',
    description: 'מותר בחוק האסלם',
    restrictions: ['pork', 'shellfish'],
  },
  'dairy-free': {
    label: 'ללא חלבי',
    emoji: '🥛',
    description: 'אבל בשר כן',
    restrictions: ['dairy', 'milk', 'cheese', 'cream'],
  },
  'gluten-free': {
    label: 'ללא גלוטן',
    emoji: '🌾',
    description: 'ללא חיטה ותרד',
    restrictions: ['wheat', 'barley', 'gluten'],
  },
};

// Common substitutions by ingredient
export const COMMON_SUBSTITUTIONS: Record<string, Array<{ substitute: string; reason: string }>> = {
  milk: [
    { substitute: 'חלב קוקוס', reason: 'טבעוני' },
    { substitute: 'חלב שקדים', reason: 'טבעוני' },
    { substitute: 'יוגורט יווני', reason: 'יותר חלבון' },
  ],
  butter: [
    { substitute: 'שמן זית', reason: 'בריאות' },
    { substitute: 'שמן קוקוס', reason: 'טבעוני' },
    { substitute: 'אבוקדו', reason: 'טבעוני' },
  ],
  eggs: [
    { substitute: 'קמח כתנה', reason: 'טבעוני' },
    { substitute: 'בננה', reason: 'טבעוני' },
  ],
  chicken: [
    { substitute: 'טוקנו', reason: 'צמחוני' },
    { substitute: 'טפו', reason: 'טבעוני' },
  ],
  flour: [
    { substitute: 'קמח שיבולת שועל', reason: 'ללא גלוטן' },
    { substitute: 'קמח אורז', reason: 'ללא גלוטן' },
  ],
};

// Common allergens
export const ALLERGENS = [
  'חלב',
  'ביצים',
  'דגים',
  'חרוצים',
  'אגוז',
  'אגוז קשיו',
  'ככליות',
  'חרדל',
  'שומשום',
  'קמח',
  'סויה',
];
