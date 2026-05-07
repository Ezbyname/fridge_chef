// ─────────────────────────────────────────────
// FAVORITES SCREEN
// ─────────────────────────────────────────────

import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';
import { GoldButton, Divider } from '../components/UI';
import { getFavorites, removeFavorite, SavedRecipe } from '../services/storage';
import { useGenerateRecipe } from '../hooks/useGenerateRecipe';
import * as Haptics from 'expo-haptics';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const { setRecipe } = useGenerateRecipe();
  const [favorites, setFavorites] = useState<SavedRecipe[]>([]);

  useEffect(() => {
    getFavorites().then(setFavorites);
  }, []);

  const handleLoad = (fav: SavedRecipe) => {
    setRecipe(fav.recipe);
    navigation.navigate('Recipe');
  };

  const handleRemove = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = await removeFavorite(id);
    setFavorites(updated);
  };

  const typeEmoji: Record<string, string> = {
    food: '🍽️', smoothie: '🥤', cocktail: '🍸',
  };

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🤍</Text>
          <Text style={styles.emptyTitle}>No saved recipes</Text>
          <Text style={styles.emptySubtitle}>Generate a recipe and tap the heart to save it</Text>
          <GoldButton
            label="Create a Recipe"
            onPress={() => navigation.navigate('Create')}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Recipes</Text>
        <Text style={styles.count}>{favorites.length} saved</Text>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const missing = item.recipe.ingredients?.filter(i => i.is_missing) ?? [];
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardType}>
                  {typeEmoji[item.recipeType] ?? '🍽️'} {item.recipeType?.toUpperCase()}
                </Text>
                <Text style={styles.cardDate}>{item.savedAt}</Text>
              </View>

              <Text style={styles.cardName}>{item.recipe.recipe_name}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.recipe.description}
              </Text>

              <View style={styles.cardMeta}>
                {item.recipe.estimated_time_minutes != null && (
                  <Text style={styles.cardMetaItem}>⏱ {item.recipe.estimated_time_minutes}m</Text>
                )}
                {item.recipe.difficulty && (
                  <Text style={styles.cardMetaItem}>📊 {item.recipe.difficulty}</Text>
                )}
                {missing.length > 0 && (
                  <Text style={[styles.cardMetaItem, { color: Colors.missing }]}>
                    🛒 {missing.length} to buy
                  </Text>
                )}
              </View>

              <Divider />

              <View style={styles.cardActions}>
                <TouchableOpacity
                  onPress={() => handleLoad(item)}
                  style={styles.loadBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loadBtnLabel}>View Recipe →</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleRemove(item.id)}
                  hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                >
                  <Text style={styles.removeBtn}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
        ListFooterComponent={() => <View style={{ height: Spacing.xxl }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg0 },

  header: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'baseline',
    padding:        Spacing.md,
    paddingBottom:  Spacing.sm,
  },
  title:  { ...Typography.displayM, color: Colors.gold },
  count:  { ...Typography.bodyS, color: Colors.textMuted },

  list: { padding: Spacing.md, paddingTop: 0 },

  card: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.borderSubtle,
    padding:         Spacing.lg,
    ...Shadow.card,
  },
  cardHeader: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginBottom:   Spacing.sm,
  },
  cardType: { ...Typography.labelS, color: Colors.textMuted, textTransform: 'uppercase' },
  cardDate: { ...Typography.caption, color: Colors.textMuted },
  cardName: { ...Typography.displayM, color: Colors.gold, marginBottom: 4 },
  cardDesc: { ...Typography.bodyS, color: Colors.textSecondary, marginBottom: Spacing.sm },

  cardMeta:     { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.sm },
  cardMetaItem: { ...Typography.caption, color: Colors.textMuted },

  cardActions:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 2 },
  loadBtn:      {},
  loadBtnLabel: { ...Typography.labelM, color: Colors.gold },
  removeBtn:    { ...Typography.caption, color: Colors.textMuted },

  // Empty
  empty: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
    padding:        Spacing.xl,
    gap:            Spacing.md,
  },
  emptyEmoji:    { fontSize: 56 },
  emptyTitle:    { ...Typography.displayM, color: Colors.textPrimary, textAlign: 'center' },
  emptySubtitle: { ...Typography.bodyM, color: Colors.textMuted, textAlign: 'center' },
});
