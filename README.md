# FridgeChef — Expo Mobile App

Premium dark-theme AI recipe generator. Hybrid camera + manual ingredient flow.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
# Open src/core/generateRecipe.ts
# The fetch call uses the Anthropic API directly.
# For production, proxy through your own backend.
# For development, you can temporarily hardcode:
#   headers: { 'Content-Type': 'application/json', 'x-api-key': 'YOUR_KEY', 'anthropic-version': '2023-06-01' }

# 3. Start
npx expo start

# Then press:
#   i → iOS Simulator
#   a → Android Emulator
#   Scan QR → Expo Go on your phone (fastest)
```

## Project Structure

```
fridgechef-expo/
├── App.tsx                         # Root entry — fonts + navigation
├── src/
│   ├── theme.ts                    # Design tokens (colors, typography, spacing)
│   ├── core/
│   │   ├── RECIPE_SCHEMA.ts        # Layer 1 — pure data contract
│   │   ├── RECIPE_META.ts          # Layer 2 — generation rules
│   │   └── generateRecipe.ts       # Layer 3 — runtime engine (v15 pipeline)
│   ├── services/
│   │   └── storage.ts              # AsyncStorage wrapper (local-first)
│   ├── hooks/
│   │   ├── useCamera.ts            # Camera + gallery + ingredient recognizer stub
│   │   └── useRecipes.ts           # Generation state + favorites + history
│   ├── navigation/
│   │   └── AppNavigator.tsx        # Bottom tabs + stack
│   ├── screens/
│   │   ├── CreateScreen.tsx        # Ingredient entry + filters + generate
│   │   ├── RecipeScreen.tsx        # Recipe display + mode actions
│   │   └── FavoritesScreen.tsx     # Saved recipes list
│   └── components/
│       └── UI.tsx                  # Shared components (GoldButton, Chip, Tag, Card)
```

## Architecture

The engine is a **schema-driven AI runtime** (not prompt engineering):

```
RECIPE_SCHEMA  →  shape only, no behavior
RECIPE_META    →  generation rules only, no shape
Runtime        →  reads both, owns neither

Pipeline:
Schema → Skeleton → sanitizeForAI → buildPromptFromMeta → API → validateStrict → UI
```

## Plugging in Real Vision (Camera AI)

In `src/hooks/useCamera.ts`, find `recognizeIngredient()` — it's a stub.
Replace with:

```typescript
const base64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
const res = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-api-key': YOUR_KEY },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514', max_tokens: 100,
    messages: [{ role: 'user', content: [
      { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
      { type: 'text', text: 'What food ingredient is in this photo? Reply with the ingredient name only.' }
    ]}]
  })
});
const data = await res.json();
return data.content[0]?.text?.trim() ?? 'ingredient';
```

## Future: Backend Sync

`src/services/storage.ts` has sync stubs at the bottom:
- `syncFavoritesToServer(userId)`
- `pullFavoritesFromServer(userId)`

Implement these when you add auth + backend.

## Build for TestFlight / Play Store

```bash
npm install -g eas-cli
eas login
eas build --platform ios    # TestFlight
eas build --platform android # Play Store
```
