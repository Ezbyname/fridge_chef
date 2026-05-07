// ─────────────────────────────────────────────
// STORAGE SERVICE
// Local-first with AsyncStorage.
// Namespaced keys ready for future backend sync.
// ─────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '../core/RECIPE_SCHEMA';

const KEYS = {
  FAVORITES: 'fc:favorites:v1',
  PREFERENCES: 'fc:preferences:v1',
  HISTORY: 'fc:history:v1',
};

// ── Favorites ─────────────────────────────────────────────────

export interface SavedRecipe {
  id:         string;
  savedAt:    string;
  recipeType: string;
  recipe:     Recipe;
}

export async function getFavorites(): Promise<SavedRecipe[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveFavorite(recipe: Recipe): Promise<SavedRecipe[]> {
  const favs = await getFavorites();
  const entry: SavedRecipe = {
    id:         recipe.id ?? Date.now().toString(),
    savedAt:    new Date().toLocaleDateString('en-GB'),
    recipeType: recipe.recipe_type ?? 'food',
    recipe,
  };
  const updated = [entry, ...favs.filter(f => f.recipe.id !== recipe.id)];
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
  return updated;
}

export async function removeFavorite(id: string): Promise<SavedRecipe[]> {
  const favs    = await getFavorites();
  const updated = favs.filter(f => f.id !== id);
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(updated));
  return updated;
}

export async function isFavorite(recipeId: string): Promise<boolean> {
  const favs = await getFavorites();
  return favs.some(f => f.recipe.id === recipeId);
}

// ── Preferences ───────────────────────────────────────────────

export interface UserPreferences {
  defaultCuisine:   string;
  defaultTaste:     string;
  defaultDifficulty: string;
  allowAlcohol:     boolean;
  missingLimit:     number;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultCuisine:    'any',
  defaultTaste:      'any',
  defaultDifficulty: 'easy',
  allowAlcohol:      true,
  missingLimit:      3,
};

export async function getPreferences(): Promise<UserPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PREFERENCES);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  const current = await getPreferences();
  await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify({ ...current, ...prefs }));
}

// ── History (last 20 recipes) ─────────────────────────────────

export async function addToHistory(recipe: Recipe): Promise<void> {
  try {
    const raw     = await AsyncStorage.getItem(KEYS.HISTORY);
    const history: Recipe[] = raw ? JSON.parse(raw) : [];
    const updated = [recipe, ...history.filter(r => r.id !== recipe.id)].slice(0, 20);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  } catch {}
}

export async function getHistory(): Promise<Recipe[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ── Future sync stub ─────────────────────────────────────────
// When backend is ready, implement these and call from storage hooks:
//
// export async function syncFavoritesToServer(userId: string): Promise<void> { ... }
// export async function pullFavoritesFromServer(userId: string): Promise<void> { ... }
