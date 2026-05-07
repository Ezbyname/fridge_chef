// ─────────────────────────────────────────────
// LAYER 1 — RECIPE_SCHEMA (Pure Data Contract)
// Defines shape and null defaults ONLY.
// No behavior. No generation rules.
// ─────────────────────────────────────────────

export const RECIPE_SCHEMA = {
  id:              null as string | null,
  recipe_name:     null as string | null,
  description:     null as string | null,
  recipe_type:     null as 'food' | 'smoothie' | 'cocktail' | null,
  active_section:  null as 'food' | 'smoothie' | 'drink' | null,
  override_reason: null as string | null,

  estimated_time_minutes: null as number | null,
  difficulty:             null as 'easy' | 'medium' | 'hard' | null,

  ingredients: [] as Ingredient[],
  steps:       [] as string[],

  serving: {
    temperature: null as string | null,
    style:       null as string | null,
  },

  drink: {
    glass_type:   null as string | null,
    garnish:      null as string | null,
    is_alcoholic: null as boolean | null,
    serve_method: null as string | null,
  },

  smoothie: {
    blend_time_seconds: null as number | null,
    texture:            null as string | null,
  },

  tips: [] as string[],
};

export type Recipe = typeof RECIPE_SCHEMA;

export interface Ingredient {
  name:       string;
  amount:     string;
  is_missing: boolean;
}

export interface IngredientItem {
  id:    string;
  name:  string;
  image: string | null;
}

export type RecipeType    = 'food' | 'smoothie' | 'cocktail';
export type ActiveSection = 'food' | 'smoothie' | 'drink';
export type RecipeMode    = 'new' | 'different' | 'similar' | 'simplify';

export const ACTIVE_SECTION_MAP: Record<RecipeType, ActiveSection> = {
  food:     'food',
  smoothie: 'smoothie',
  cocktail: 'drink',
};
