// ─────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────

import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Image
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../theme';

// ── GoldButton ────────────────────────────────────────────────

interface GoldButtonProps {
  label:     string;
  onPress:   () => void;
  disabled?: boolean;
  loading?:  boolean;
  variant?:  'primary' | 'secondary' | 'ghost';
  emoji?:    string;
}

export function GoldButton({ label, onPress, disabled, loading, variant = 'primary', emoji }: GoldButtonProps) {
  const isPrimary   = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[
        styles.btn,
        isPrimary   && styles.btnPrimary,
        isSecondary && styles.btnSecondary,
        variant === 'ghost' && styles.btnGhost,
        (disabled || loading) && styles.btnDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Colors.bg0 : Colors.gold} size="small" />
      ) : (
        <Text style={[styles.btnLabel, !isPrimary && styles.btnLabelAlt]}>
          {emoji ? `${emoji}  ` : ''}{label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ── Chip selector ─────────────────────────────────────────────

interface ChipProps {
  label:    string;
  emoji?:   string;
  active:   boolean;
  onPress:  () => void;
  color?:   string;
}

export function Chip({ label, emoji, active, onPress, color = Colors.gold }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        active && { backgroundColor: color + '22', borderColor: color + '66' },
      ]}
    >
      <Text style={[styles.chipText, active && { color }]}>
        {emoji ? `${emoji} ` : ''}{label}
      </Text>
    </TouchableOpacity>
  );
}

// ── Section header ────────────────────────────────────────────

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ── Ingredient tag ────────────────────────────────────────────

interface IngredientTagProps {
  name:      string;
  image?:    string | null;
  isAvoid?:  boolean;
  isPending?: boolean;
  onRemove:  () => void;
}

export function IngredientTag({ name, image, isAvoid, isPending, onRemove }: IngredientTagProps) {
  return (
    <View style={[styles.tag, isAvoid && styles.tagAvoid]}>
      {image ? (
        <Image source={{ uri: image }} style={styles.tagImage} />
      ) : (
        <Text style={styles.tagEmoji}>{isAvoid ? '🚫' : '✓'}</Text>
      )}
      <Text style={[styles.tagLabel, isAvoid && styles.tagLabelAvoid, isPending && styles.tagLabelPending]} numberOfLines={1}>
        {name}
      </Text>
      <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Text style={styles.tagRemove}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Card wrapper ──────────────────────────────────────────────

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Divider ───────────────────────────────────────────────────

export function Divider() {
  return <View style={styles.divider} />;
}

// ── Styles ───────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Button
  btn: {
    borderRadius:  Radius.md,
    paddingVertical:   15,
    paddingHorizontal: 24,
    alignItems:    'center',
    justifyContent: 'center',
    minHeight:     52,
  },
  btnPrimary: {
    backgroundColor: Colors.gold,
    ...Shadow.gold,
  },
  btnSecondary: {
    backgroundColor: Colors.goldGlow,
    borderWidth:     1,
    borderColor:     Colors.borderGold,
  },
  btnGhost: {
    backgroundColor: Colors.bg3,
    borderWidth:     1,
    borderColor:     Colors.borderMid,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnLabel: {
    ...Typography.labelM,
    color:       Colors.bg0,
    fontFamily:  'DMSans_600SemiBold',
    fontSize:    15,
    letterSpacing: 0.3,
  },
  btnLabelAlt: {
    color: Colors.gold,
  },

  // Chip
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical:   Spacing.sm,
    borderRadius:      Radius.full,
    backgroundColor:   Colors.bg3,
    borderWidth:       1,
    borderColor:       Colors.borderSubtle,
    margin:            3,
  },
  chipText: {
    ...Typography.labelM,
    color: Colors.textSecondary,
  },

  // Section
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.displayM,
    color: Colors.gold,
    marginBottom: 2,
  },
  sectionSubtitle: {
    ...Typography.bodyS,
    color: Colors.textMuted,
  },

  // Tag
  tag: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             6,
    paddingVertical:   6,
    paddingHorizontal: 10,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.bg3,
    borderWidth:     1,
    borderColor:     Colors.borderSubtle,
    margin:          3,
  },
  tagAvoid: {
    backgroundColor: 'rgba(201,108,90,0.1)',
    borderColor:     'rgba(201,108,90,0.3)',
  },
  tagImage: {
    width:        22,
    height:       22,
    borderRadius: 5,
  },
  tagEmoji: {
    fontSize: 13,
  },
  tagLabel: {
    ...Typography.bodyS,
    color:    Colors.textPrimary,
    maxWidth: 100,
  },
  tagLabelAvoid: {
    color: Colors.missing,
  },
  tagLabelPending: {
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  tagRemove: {
    fontSize:   17,
    color:      Colors.textMuted,
    lineHeight: 18,
  },

  // Card
  card: {
    backgroundColor: Colors.bg1,
    borderRadius:    Radius.lg,
    borderWidth:     1,
    borderColor:     Colors.borderSubtle,
    padding:         Spacing.lg,
    ...Shadow.card,
  },

  // Divider
  divider: {
    height:          1,
    backgroundColor: Colors.borderSubtle,
    marginVertical:  Spacing.md,
  },
});
