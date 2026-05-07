// ─────────────────────────────────────────────
// useFavorites
// Owns: favorites list, save/remove, isSaved check.
// Loads from AsyncStorage on mount.
// ─────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import { Recipe } from '../core/RECIPE_SCHEMA';
import { getFavorites, saveFavorite, removeFavorite, SavedRecipe } from '../services/storage';
import * as Haptics from 'expo-haptics';

export function useFavorites() {
  const [favorites, setFavorites] = useState<SavedRecipe[]>([]);

  useEffect(() => {
    getFavorites().then(setFavorites);
  }, []);

  const save = useCallback(async (recipe: Recipe) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = await saveFavorite(recipe);
    setFavorites(updated);
  }, []);

  const remove = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = await removeFavorite(id);
    setFavorites(updated);
  }, []);

  const isSaved = useCallback((recipeId: string | null): boolean =>
    !!recipeId && favorites.some(f => f.recipe.id === recipeId),
    [favorites]
  );

  const refresh = useCallback(async () => {
    const updated = await getFavorites();
    setFavorites(updated);
  }, []);

  return { favorites, save, remove, isSaved, refresh };
}
