// ─────────────────────────────────────────────
// DIETARY SELECTOR COMPONENT
// Multi-select for dietary types + allergies
// ─────────────────────────────────────────────

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { Card, SectionHeader } from './UI';

export interface DietaryOption {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

const DIETARY_OPTIONS: DietaryOption[] = [
  { id: 'omnivore', label: 'בשרי', emoji: '🍖️', description: 'כל מיני אוכל' },
  { id: 'vegetarian', label: 'צמחוני', emoji: '🥗', description: 'ללא בשר' },
  { id: 'vegan', label: 'טבעוני', emoji: '🌱', description: 'ללא בשר וחלבי' },
  { id: 'pescatarian', label: 'דגים וחלבי', emoji: '🐟', description: 'דגים כן, בשר לא' },
  { id: 'kosher', label: 'כשר', emoji: '✡️', description: 'כשר' },
  { id: 'halal', label: 'חלאל', emoji: '☪️', description: 'חלאל' },
  { id: 'dairy-free', label: 'ללא חלבי', emoji: '🥛', description: 'ללא חלבי' },
  { id: 'gluten-free', label: 'ללא גלוטן', emoji: '🌾', description: 'ללא גלוטן' },
];

const ALLERGENS = [
  { id: 'dairy', label: 'חלב', emoji: '🧈' },
  { id: 'eggs', label: 'ביצים', emoji: '🥚' },
  { id: 'fish', label: 'דגים', emoji: '🐠' },
  { id: 'nuts', label: 'אגוז', emoji: '🥜' },
  { id: 'shellfish', label: 'חרוצים', emoji: '🦐' },
  { id: 'sesame', label: 'שומשום', emoji: '🫓' },
  { id: 'soy', label: 'סויה', emoji: '🫘' },
  { id: 'wheat', label: 'חיטה', emoji: '🌾' },
];

interface DietarySelectorProps {
  selected: string | null;
  allergies: string[];
  onDietaryChange: (id: string) => void;
  onAllergyToggle: (id: string) => void;
}

export function DietarySelector({
  selected,
  allergies,
  onDietaryChange,
  onAllergyToggle,
}: DietarySelectorProps) {
  return (
    <View style={styles.container}>
      {/* Dietary Type Selection */}
      <Card style={styles.section}>
        <SectionHeader title="🌍 סוג תפריט" subtitle="בחר סוג תפריט" />
        <FlatList
          data={DIETARY_OPTIONS}
          numColumns={2}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onDietaryChange(item.id)}
              style={[
                styles.dietaryOption,
                selected === item.id && styles.dietaryOptionActive,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.dietaryEmoji}>{item.emoji}</Text>
              <Text style={[styles.dietaryLabel, selected === item.id && styles.dietaryLabelActive]}>
                {item.label}
              </Text>
              <Text style={[styles.dietaryDesc, selected === item.id && styles.dietaryDescActive]}>
                {item.description}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item.id}
          columnWrapperStyle={styles.dietaryRow}
        />
      </Card>

      {/* Allergen Exclusions */}
      <Card style={styles.section}>
        <SectionHeader title="⚠️ אלרגיות" subtitle="בחר מה שאתה לא צורך" />
        <View style={styles.allergyGrid}>
          {ALLERGENS.map(allergen => (
            <TouchableOpacity
              key={allergen.id}
              onPress={() => onAllergyToggle(allergen.id)}
              style={[
                styles.allergyChip,
                allergies.includes(allergen.id) && styles.allergyChipActive,
              ]}
              activeOpacity={0.7}
            >
              <Text style={styles.allergyEmoji}>{allergen.emoji}</Text>
              <Text style={[styles.allergyLabel, allergies.includes(allergen.id) && styles.allergyLabelActive]}>
                {allergen.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },

  section: {
    gap: 0,
  },

  // Dietary type grid
  dietaryRow: {
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dietaryOption: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.bg3,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dietaryOptionActive: {
    backgroundColor: Colors.goldGlow,
    borderColor: Colors.gold,
  },
  dietaryEmoji: {
    fontSize: 28,
  },
  dietaryLabel: {
    ...Typography.labelM,
    color: Colors.textSecondary,
  },
  dietaryLabelActive: {
    color: Colors.gold,
  },
  dietaryDesc: {
    ...Typography.bodyXS,
    color: Colors.textMuted,
  },
  dietaryDescActive: {
    color: Colors.gold,
  },

  // Allergen chips
  allergyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.bg2,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  allergyChipActive: {
    backgroundColor: '#d9534f',
    borderColor: '#c9302c',
  },
  allergyEmoji: {
    fontSize: 18,
  },
  allergyLabel: {
    ...Typography.labelM,
    color: Colors.textSecondary,
  },
  allergyLabelActive: {
    color: Colors.textPrimary,
  },
});
