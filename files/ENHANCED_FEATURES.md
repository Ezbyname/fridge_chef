[ENHANCED_FEATURES.md](https://github.com/user-attachments/files/27466144/ENHANCED_FEATURES.md)
# FridgeChef — Enhanced Features: Dietary & Ingredients

**Status:** ✅ Ready to integrate  
**Language:** Hebrew + English  
**Date:** May 2, 2026

---

## New Features Added

### 1. ✅ Dietary Type Selection (סוג תפריט)

**Options:**
```
🍖️ בשרי (Omnivore)      — כל מיני אוכל
🥗 צמחוני (Vegetarian)  — ללא בשר, כן חלביים
🌱 טבעוני (Vegan)       — ללא בשר ולא חלביים
🐟 דגים וחלבי (Pescatarian) — דגים כן, בשר אדום לא
✡️  כשר (Kosher)        — כשר
☪️  חלאל (Halal)         — חלאל
🥛 ללא חלבי (Dairy-Free) — אבל בשר כן
🌾 ללא גלוטן (Gluten-Free) — ללא חיטה
```

**What Happens:**
- User selects dietary type
- AI filters out restricted ingredients
- Returns only compliant recipes
- Suggests substitutions if needed

---

### 2. ✅ Allergen Exclusions (אלרגיות)

**Allergens Tracked:**
```
🧈 חלב (Milk)
🥚 ביצים (Eggs)
🐠 דגים (Fish)
🥜 אגוז (Nuts)
🦐 חרוצים (Shellfish)
🫓 שומשום (Sesame)
🫘 סויה (Soy)
🌾 חיטה (Wheat/Gluten)
```

**What Happens:**
- User selects allergens to avoid
- Recipe excludes ingredients with those allergens
- Warning if allergen detected in recipe
- Suggests allergy-safe alternatives

---

### 3. ✅ Ingredient Categorization (קטגוריות)

**Categories:**
```
🌶️ תבלינים (Spices)    — שום, פלפל, כורכום, עלי דפנה
🌿 עשבים (Herbs)      — פטרוזיליה, בזיליקום, נענע
🥕 ירקות (Vegetables) — עגבניה, בצל, קרוט, סלרי
🍎 פירות (Fruits)     — תפוח, תותה, בננה, לימון
🥚 חלבונים (Proteins) — עוף, בשר, דגים, ביצים, טוקנו
🧀 חלביים (Dairy)     — גבינה, חלב, יוגורט, קרם
🍯 אחרים (Other)      — שמן, דבש, סוכר, קמח
```

**What Happens:**
- Each ingredient has a category
- User can prefer certain categories
- Recipes organized by ingredient type
- Better shopping list generation

---

### 4. ✅ Missing Ingredients Handling (חסרים)

**Old:** "אתה חסר 3 חומרים"  
**New:** Shows exactly which ones + substitutes

**Example:**
```
חסרים:
  🥚 ביצים (Eggs)
     → תחליפים: קמח כתנה, בננה (for vegan)
  
  🧈 חמאה (Butter)
     → תחליפים: שמן זית, שמן קוקוס (dairy-free)
  
  🌾 חיטה (Wheat)
     → תחליפים: קמח שיבולת שועל (gluten-free)
```

---

### 5. ✅ Smart Substitutions (תחליפים)

**Automatic Suggestions Based On:**
- Dietary type (צמחוני → no meat options)
- Allergies (dairy-free → alternative milks)
- Category preference (prefer herbs → herb-forward)

**Example:**
```
Missing: חלב (Milk)
User: טבעוני (Vegan)
↓
Suggested:
  ✅ חלב קוקוס (coconut milk)
  ✅ חלב שקדים (almond milk)
  ✅ חלב אורז (rice milk)

User: ללא חלבי (Dairy-free)
↓
Suggested:
  ✅ חלב קוקוס
  ✅ חלב אורז
  ✅ אבוקדו (for creamy sauces)
```

---

### 6. ✅ Nutrition Facts (תזונה)

**Per Serving:**
```
🔥 Calories: 350 kcal
🍗 Protein: 25g
🍞 Carbs: 40g
🧈 Fat: 12g
🌾 Fiber: 6g
```

**Show When:**
- Available from AI
- User requests (toggle)
- Dietary type selected (high protein for vegan, etc.)

---

### 7. ✅ Allergen Warnings (אזהרות)

**Example Recipe:**
```
מתכון: עוגיות חמאה

⚠️ אלרגנים:
  🥚 ביצים
  🧈 חלב
  🌾 גלוטן

⚠️ זהירות:
  - אם אתה טבעוני: תחליפים זמינים
  - אם אתה ללא גלוטן: בחר קמח שיבולת שועל
```

---

## Files Created

| File | Purpose |
|------|---------|
| `RECIPE_SCHEMA_ENHANCED.ts` | Extended recipe schema with dietary fields |
| `RECIPE_META_ENHANCED.ts` | Rules for filling new dietary fields |
| `GenerationContext_ENHANCED.ts` | Context with dietary filters + helpers |
| `DietarySelector.tsx` | UI component for dietary selection |

---

## How to Integrate

### Step 1: Import in CreateScreen

```tsx
import { DietarySelector } from '../components/DietarySelector';

// In component state:
const [dietaryType, setDietaryType] = useState<string>('omnivore');
const [allergyExclusions, setAllergyExclusions] = useState<string[]>([]);
```

### Step 2: Add to UI

```tsx
<DietarySelector
  selected={dietaryType}
  allergies={allergyExclusions}
  onDietaryChange={setDietaryType}
  onAllergyToggle={(id) => {
    setAllergyExclusions(prev =>
      prev.includes(id)
        ? prev.filter(a => a !== id)
        : [...prev, id]
    );
  }}
/>
```

### Step 3: Pass to Generation Context

```tsx
const ctx: GenerationContext = {
  recipeType,
  ingredientsHave,
  ingredientsAvoid,
  filters: {
    ...otherFilters,
    dietaryType,
    allergyExclusions,
  },
};
```

### Step 4: Update Vercel Function Prompt

Include dietary constraints in AI prompt:

```
Dietary Type: בשרי (Omnivore)
Exclude Allergens: [חלב, ביצים]

Rules:
- NO ingredients from excluded allergens
- ALL ingredients match dietary type
- Suggest substitutions for any restricted ingredients
```

---

## API Changes

### Vercel Function Input

**Before:**
```json
{
  "recipeType": "food",
  "ingredients_have": ["עגבניה", "בצל"],
  "ingredients_avoid": []
}
```

**After:**
```json
{
  "recipeType": "food",
  "ingredients_have": ["עגבניה", "בצל"],
  "ingredients_avoid": [],
  "dietary_type": "vegetarian",
  "allergy_exclusions": ["dairy", "eggs"]
}
```

### Recipe Output

**Before:**
```json
{
  "recipe_name": "סלט עגבניות",
  "ingredients": [...]
}
```

**After:**
```json
{
  "recipe_name": "סלט עגבניות",
  "ingredients": [
    { "name": "עגבניה", "category": "vegetable", ... },
    { "name": "בצל", "category": "vegetable", ... },
    { "name": "שמן זית", "category": "other", ... }
  ],
  "dietary_type": "vegetarian",
  "dietary_notes": "טבעוני-מקובל",
  "allergens": [],
  "nutrition": {
    "calories_per_serving": 150,
    "protein_g": 3,
    ...
  }
}
```

---

## Testing Checklist

- [ ] Select dietary type → recipe changes
- [ ] Select allergens → excluded from recipe
- [ ] Missing ingredient → shows substitutes
- [ ] Substitutes → match dietary type
- [ ] Nutrition info → appears when available
- [ ] Allergen warnings → show if present
- [ ] Ingredient categories → displayed correctly

---

## Example Flows

### Flow 1: Vegan User with Nut Allergy

```
1. User: טבעוני (Vegan) + אגוז (Nuts) excluded
2. AI receives: dietary_type=vegan, allergy_exclusions=[nuts]
3. AI generates recipe with:
   - NO meat, dairy, eggs, honey
   - NO nuts or nut butters
   - Suggests: חלב שקדים → חלב קוקוס
4. Recipe shows:
   ✅ סוג תפריט: טבעוני
   ✅ אלרגנים: חלב, בשר
   ⚠️ הערה: אין אגוז
```

### Flow 2: Gluten-Free Kosher User

```
1. User: כשר (Kosher) + גלוטן (Gluten) excluded
2. AI receives: dietary_type=kosher, allergy_exclusions=[wheat]
3. AI generates recipe with:
   - NO pork, shellfish, rabbit
   - NO wheat, barley
   - Suggests: קמח חיטה → קמח שיבולת שועל
4. Recipe shows:
   ✅ סוג תפריט: כשר
   ✅ אלרגנים: חיטה
```

### Flow 3: Pescatarian with Dairy Allergy

```
1. User: דגים וחלבי + חלב (Dairy) excluded
2. AI receives: dietary_type=pescatarian, allergy_exclusions=[dairy]
3. AI generates recipe with:
   - Fish OK, meat NO
   - NO dairy, butter, cream
   - Suggests: חלב → חלב שקדים / קוקוס
4. Recipe shows:
   ✅ סוג תפריט: דגים וחלבי
   ✅ אלרגנים: חלב
   ⚠️ הערה: בשר אדום לא (pescatarian)
```

---

## Future Enhancements

1. **Nutritional Goals:** "High protein" → prioritize protein-rich recipes
2. **Calorie Limits:** "500 cal max" → show only light recipes
3. **Cooking Time:** "30 min max" → skip slow-cooked recipes
4. **Shopping List:** Auto-generate with dietary labels
5. **Meal Planning:** Weekly meal plan respecting dietary preferences
6. **Restaurant Mode:** "Nearby vegan restaurants" via Vercel backend
7. **Community Recipes:** Share recipes tagged with dietary info

---

## Hebrew/English Support

**All labels bilingual:**
```tsx
{
  id: 'vegetarian',
  label: 'צמחוני',        // Hebrew
  labelEn: 'Vegetarian',  // English
  emoji: '🥗',
  description: 'ללא בשר', // Hebrew desc
  descriptionEn: 'No meat' // English desc
}
```

Users can toggle language in app settings.

---

## Summary

✅ 8 dietary types  
✅ 8+ allergens  
✅ 7 ingredient categories  
✅ Automatic substitutions  
✅ Nutrition facts  
✅ Allergen warnings  
✅ Hebrew + English support  
✅ Full UI components ready to use

Ready to integrate into CreateScreen + Vercel backend.

