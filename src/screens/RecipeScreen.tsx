// ─────────────────────────────────────────────
// RECIPE SCREEN
// Displays generated recipe with full detail.
// Mode action bar: Different | Similar | Simplify
// Save / unsave to favorites.
// ─────────────────────────────────────────────

import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Card, Divider, GoldButton } from '../components/UI';
import { useGenerateRecipe } from '../hooks/useGenerateRecipe';
import { useFavorites } from '../hooks/useFavorites';
import { RecipeMode } from '../core/RECIPE_SCHEMA';
import * as Haptics from 'expo-haptics';

const MODE_ACTIONS: { mode: RecipeMode; label: string; emoji: string; color: string }[] = [
  { mode: 'different', label: 'Different', emoji: '🔄', color: Colors.textSecondary },
  { mode: 'similar',   label: 'Similar',   emoji: '🔁', color: '#b8f0c8' },
  { mode: 'simplify',  label: 'Simplify',  emoji: '⚡', color: '#ffb8d4' },
];

export default function RecipeScreen() {
  const navigation = useNavigation<any>();
  const { recipe, setRecipe, isLoading, error, regenWithMode, clearError } = useGenerateRecipe();
  const { isSaved, save, remove: unsave } = useFavorites();

  const handleMode = async (mode: RecipeMode) => {
    if (!recipe) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Re-generate with same context stored in recipe metadata
    // For now we use the recipe's own type as a signal
    await regenWithMode(mode);
        recipe_type:       recipe.recipe_type ?? 'food',
        ingredients_have:  recipe.ingredients?.filter(i => !i.is_missing).map(i => i.name) ?? [],
        ingredients_avoid: [],
        missing_limit:     3,
        taste:             'any',
        cuisine:           'any',
        time_limit:        60,
        difficulty:        'easy',
        allow_alcohol:     true,
      } as any,
      mode
    );
  };

  const handleSaveToggle = async () => {
    if (!recipe?.id) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSaved(recipe.id)) {
      await unsave(recipe.id);
    } else {
      await save();
    }
  };

  // ── Empty state ───────────────────────────────────────────

  if (!recipe && !isLoading && !error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🍽️</Text>
          <Text style={styles.emptyTitle}>No recipe yet</Text>
          <Text style={styles.emptySubtitle}>Add ingredients and tap Generate</Text>
          <GoldButton
            label="Go to Create"
            onPress={() => navigation.navigate('Create')}
            variant="secondary"
            style={{ marginTop: Spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading state ─────────────────────────────────────────

  if (isLoading) {
    const emojis: Record<string, string> = { food: '🍳', smoothie: '🥤', cocktail: '🍸' };
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.loadingEmoji}>{emojis[recipe?.recipe_type ?? 'food'] ?? '🍳'}</Text>
          <Text style={styles.loadingText}>Chef AI is cooking…</Text>
          <ActivityIndicator color={Colors.gold} size="large" style={{ marginTop: Spacing.lg }} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Error state ───────────────────────────────────────────

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>⚠️</Text>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
          <GoldButton label="Try Again" onPress={clearError} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) return null;

  const have    = recipe.ingredients?.filter(i => !i.is_missing) ?? [];
  const missing = recipe.ingredients?.filter(i => i.is_missing)  ?? [];
  const saved   = isSaved(recipe.id);

  const typeLabel: Record<string, string> = {
    food:     '🍽️ FOOD',
    smoothie: '🥤 SMOOTHIE',
    cocktail: '🍸 COCKTAIL',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerMeta}>
            <Text style={styles.typeLabel}>{typeLabel[recipe.recipe_type ?? 'food']}</Text>
            {recipe.active_section && recipe.active_section !== recipe.recipe_type && (
              <Text style={styles.overrideLabel}>⚠️ {recipe.override_reason}</Text>
            )}
          </View>
          <TouchableOpacity onPress={handleSaveToggle} hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <Text style={styles.saveBtn}>{saved ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.recipeName}>{recipe.recipe_name}</Text>
        <Text style={styles.recipeDesc}>{recipe.description}</Text>

        {/* Meta badges */}
        <View style={styles.metaRow}>
          {recipe.estimated_time_minutes != null && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>⏱ {recipe.estimated_time_minutes} min</Text>
            </View>
          )}
          {recipe.difficulty && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>📊 {recipe.difficulty}</Text>
            </View>
          )}
          {recipe.drink?.glass_type && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>🥃 {recipe.drink.glass_type}</Text>
            </View>
          )}
          {recipe.drink?.serve_method && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>🍹 {recipe.drink.serve_method}</Text>
            </View>
          )}
          {recipe.smoothie?.texture && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>🌊 {recipe.smoothie.texture}</Text>
            </View>
          )}
          {recipe.smoothie?.blend_time_seconds != null && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>⏱ {recipe.smoothie.blend_time_seconds}s blend</Text>
            </View>
          )}
          {missing.length > 0 && (
            <View style={[styles.metaBadge, styles.metaBadgeMissing]}>
              <Text style={[styles.metaText, { color: Colors.missing }]}>🛒 {missing.length} to buy</Text>
            </View>
          )}
        </View>

        <Divider />

        {/* Ingredients */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>INGREDIENTS</Text>
          {have.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <Text style={styles.ingredientCheck}>✓</Text>
              <Text style={styles.ingredientName}>{ing.name}</Text>
              <Text style={styles.ingredientAmount}>{ing.amount}</Text>
            </View>
          ))}
          {missing.map((ing, i) => (
            <View key={i} style={styles.ingredientRow}>
              <Text style={styles.ingredientMissingIcon}>🛒</Text>
              <Text style={[styles.ingredientName, { color: Colors.missing }]}>{ing.name}</Text>
              <Text style={styles.ingredientAmount}>{ing.amount}</Text>
            </View>
          ))}
        </Card>

        {/* Steps */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            {recipe.active_section === 'smoothie' ? 'BLEND STEPS' : recipe.active_section === 'drink' ? 'METHOD' : 'STEPS'}
          </Text>
          {recipe.steps?.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Card>

        {/* Serving / Drink details */}
        {recipe.serving?.temperature && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>SERVING</Text>
            <Text style={styles.detailText}>🌡️ {recipe.serving.temperature}</Text>
            {recipe.serving.style && (
              <Text style={styles.detailText}>🍽️ {recipe.serving.style}</Text>
            )}
          </Card>
        )}
        {recipe.drink?.garnish && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>GARNISH</Text>
            <Text style={styles.detailText}>🌿 {recipe.drink.garnish}</Text>
          </Card>
        )}

        {/* Tips */}
        {recipe.tips && recipe.tips.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>TIPS</Text>
            {recipe.tips.map((tip, i) => (
              <Text key={i} style={styles.tipText}>💡 {tip}</Text>
            ))}
          </Card>
        )}

        <Divider />

        {/* Mode action bar */}
        <View style={styles.modeBar}>
          {MODE_ACTIONS.map(({ mode, label, emoji, color }) => (
            <TouchableOpacity
              key={mode}
              onPress={() => handleMode(mode)}
              disabled={isLoading}
              style={styles.modeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.modeEmoji}>{emoji}</Text>
              <Text style={[styles.modeLabel, { color }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg0 },
  scroll:  { flex: 1 },
  content: { padding: Spacing.md },

  // Empty / Loading
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: Spacing.xl, gap: Spacing.md,
  },
  emptyEmoji:    { fontSize: 56 },
  emptyTitle:    { ...Typography.displayM, color: Colors.textPrimary, textAlign: 'center' },
  emptySubtitle: { ...Typography.bodyM, color: Colors.textMuted, textAlign: 'center' },
  loading:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  loadingEmoji:  { fontSize: 64 },
  loadingText:   { ...Typography.bodyL, color: Colors.textSecondary },

  // Header
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  headerMeta:  { flex: 1 },
  typeLabel:   { ...Typography.labelS, color: Colors.textMuted, textTransform: 'uppercase', marginBottom: 2 },
  overrideLabel: { ...Typography.caption, color: Colors.warning, marginTop: 4 },
  saveBtn:     { fontSize: 28 },

  recipeName: { ...Typography.displayL, color: Colors.gold, marginBottom: Spacing.sm },
  recipeDesc: { ...Typography.bodyM, color: Colors.textSecondary, marginBottom: Spacing.md },

  // Meta badges
  metaRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  metaBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical:   4,
    borderRadius:      Radius.sm,
    backgroundColor:   Colors.bg2,
    borderWidth:       1,
    borderColor:       Colors.borderSubtle,
  },
  metaBadgeMissing: {
    backgroundColor: 'rgba(201,122,90,0.1)',
    borderColor:     'rgba(201,122,90,0.25)',
  },
  metaText: { ...Typography.caption, color: Colors.textSecondary },

  // Sections
  section:      { marginBottom: Spacing.md },
  sectionTitle: {
    ...Typography.labelS,
    color:         Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom:  Spacing.md,
  },

  // Ingredients
  ingredientRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingVertical: 6,
    gap:            Spacing.sm,
  },
  ingredientCheck:      { color: Colors.success, fontSize: 14, width: 18 },
  ingredientMissingIcon: { fontSize: 14, width: 18 },
  ingredientName:       { ...Typography.bodyM, color: Colors.textPrimary, flex: 1 },
  ingredientAmount:     { ...Typography.bodyS, color: Colors.textMuted },

  // Steps
  stepRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md, alignItems: 'flex-start' },
  stepNumber: {
    width:           26,
    height:          26,
    borderRadius:    13,
    backgroundColor: Colors.goldGlow,
    borderWidth:     1,
    borderColor:     Colors.borderGold,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  stepNumberText: { ...Typography.labelS, color: Colors.gold },
  stepText:       { ...Typography.bodyM, color: Colors.textSecondary, flex: 1, lineHeight: 22 },

  // Details
  detailText: { ...Typography.bodyM, color: Colors.textSecondary, marginBottom: 4 },
  tipText:    { ...Typography.bodyM, color: 'rgba(201,168,76,0.7)', marginBottom: 4 },

  // Mode bar
  modeBar: {
    flexDirection:   'row',
    justifyContent:  'space-around',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.bg1,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.borderSubtle,
    marginBottom:    Spacing.md,
  },
  modeBtn:   { alignItems: 'center', gap: 4, flex: 1 },
  modeEmoji: { fontSize: 22 },
  modeLabel: { ...Typography.labelS },
});
