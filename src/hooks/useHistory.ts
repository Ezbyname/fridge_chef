// ─────────────────────────────────────────────
// useHistory
// Last 20 generated recipes. Read-only from UI.
// Written by useGenerateRecipe after each generation.
// ─────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react';
import { Recipe } from '../core/RECIPE_SCHEMA';
import { getHistory } from '../services/storage';

export function useHistory() {
  const [history, setHistory] = useState<Recipe[]>([]);

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  const refresh = useCallback(async () => {
    const updated = await getHistory();
    setHistory(updated);
  }, []);

  return { history, refresh };
}
