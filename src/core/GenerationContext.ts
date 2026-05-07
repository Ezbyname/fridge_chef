// ─────────────────────────────────────────────
// GENERATION CONTEXT
// Single source of truth passed between screens.
// Hybrid flow: ingredients come from manual entry
// AND from camera recognition (merged together).
// ─────────────────────────────────────────────

import { RecipeType } from './RECIPE_SCHEMA';

export interface IngredientSuggestion {
  name:       string;
  confidence: number;    // 0–1, for vision-detected items
  fromCamera: boolean;   // true = AI suggestion, false = manually typed
  imageUri?:  string;    // thumbnail if captured from camera
}

export interface GenerationFilters {
  cuisine:      string;
  taste:        string;
  difficulty:   'easy' | 'medium' | 'hard';
  timeLimit:    number;    // minutes
  missingLimit: number;
  allowAlcohol: boolean;
}

export interface GenerationContext {
  // What kind of recipe
  recipeType: RecipeType;

  // Ingredients — unified from both manual + camera
  ingredientsHave:  IngredientSuggestion[];
  ingredientsAvoid: string[];

  // Filters
  filters: GenerationFilters;

  // Snapshot of camera image (for display, not sent to API)
  cameraImageUri?: string;
}

// ── Default values ─────────────────────────────────────────────

export const DEFAULT_FILTERS: GenerationFilters = {
  cuisine:      'any',
  taste:        'any',
  difficulty:   'easy',
  timeLimit:    30,
  missingLimit: 3,
  allowAlcohol: true,
};

export function emptyContext(recipeType: RecipeType = 'food'): GenerationContext {
  return {
    recipeType,
    ingredientsHave:  [],
    ingredientsAvoid: [],
    filters:          { ...DEFAULT_FILTERS },
  };
}

// ── Adapter: GenerationContext → generateRecipe() params ────────

import { GenerationContext as EngineContext } from './generateRecipe';

export function toEngineContext(ctx: GenerationContext): EngineContext {
  return {
    recipe_type:       ctx.recipeType,
    ingredients_have:  ctx.ingredientsHave.map(i => i.name),
    ingredients_avoid: ctx.ingredientsAvoid,
    missing_limit:     ctx.filters.missingLimit,
    taste:             ctx.filters.taste,
    cuisine:           ctx.filters.cuisine,
    time_limit:        ctx.filters.timeLimit,
    difficulty:        ctx.filters.difficulty,
    allow_alcohol:     ctx.filters.allowAlcohol,
  };
}
