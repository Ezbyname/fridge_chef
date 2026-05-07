// ─────────────────────────────────────────────
// useGenerateRecipe
// Owns: generation state, last recipe ref, mode calls.
// Does NOT own favorites or history — separate hooks.
// ─────────────────────────────────────────────

import { useState, useCallback, useRef, useEffect } from 'react';
import { generateRecipe } from '../core/generateRecipe';
import { Recipe, RecipeMode } from '../core/RECIPE_SCHEMA';
import { GenerationContext, toEngineContext } from '../core/GenerationContext';
import { addToHistory } from '../services/storage';

export function useGenerateRecipe() {
  const [recipe, setRecipe]     = useState<Recipe | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const lastRecipeRef           = useRef<Recipe | null>(null);

  useEffect(() => { lastRecipeRef.current = recipe; }, [recipe]);

  const generate = useCallback(async (context: GenerationContext, mode: RecipeMode = 'new') => {
    setLoading(true);
    setError(null);
    try {
      const engineCtx = toEngineContext(context);
      const result    = await generateRecipe(engineCtx, mode, lastRecipeRef.current);
      setRecipe(result);
      await addToHistory(result);
    } catch (e: any) {
      setError(e?.message ?? 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-generate with mode using current recipe's ingredients as context
  const regenWithMode = useCallback(async (mode: RecipeMode) => {
    const r = lastRecipeRef.current;
    if (!r) return;
    await generate(
      {
        recipeType:       r.recipe_type ?? 'food',
        ingredientsHave:  (r.ingredients ?? [])
          .filter(i => !i.is_missing)
          .map(i => ({ name: i.name, confidence: 1, fromCamera: false })),
        ingredientsAvoid: [],
        filters: {
          cuisine: 'any', taste: 'any', difficulty: 'easy',
          timeLimit: 60, missingLimit: 3, allowAlcohol: true,
        },
      },
      mode
    );
  }, [generate]);

  const clearError = useCallback(() => setError(null), []);

  return { recipe, setRecipe, isLoading, error, generate, regenWithMode, clearError };
}
