// ─────────────────────────────────────────────
// CREATE SCREEN
// Hybrid: camera capture + manual ingredient editing
// Filters: recipe type, cuisine, taste
// Generates recipe → navigates to RecipeScreen
// ─────────────────────────────────────────────

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Modal, Animated, KeyboardAvoidingView, Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, Radius } from '../theme';
import { GoldButton, Chip, SectionHeader, IngredientTag, Card, Divider } from '../components/UI';
import { useCamera } from '../hooks/useCamera';
import { useGenerateRecipe } from '../hooks/useGenerateRecipe';
import { RecipeType } from '../core/RECIPE_SCHEMA';
import {
  GenerationContext,
  IngredientSuggestion,
  toEngineContext
} from '../core/GenerationContext';

// ── Option sets ───────────────────────────────────────────────

const RECIPE_TYPES = [
  { id: 'food',     label: 'Food',     emoji: '🍽️' },
  { id: 'smoothie', label: 'Smoothie', emoji: '🥤' },
  { id: 'cocktail', label: 'Cocktail', emoji: '🍸' },
] as const;

const CUISINE_OPTIONS = [
  { id: 'any',      label: 'Any',          emoji: '🌍' },
  { id: 'italian',  label: 'Italian',      emoji: '🍝' },
  { id: 'chinese',  label: 'Chinese',      emoji: '🍜' },
  { id: 'mexican',  label: 'Mexican',      emoji: '🌮' },
  { id: 'mideast',  label: 'Middle East',  emoji: '🧆' },
  { id: 'indian',   label: 'Indian',       emoji: '🍛' },
  { id: 'japanese', label: 'Japanese',     emoji: '🍱' },
  { id: 'american', label: 'American',     emoji: '🍔' },
  { id: 'french',   label: 'French',       emoji: '🥐' },
];

const TASTE_OPTIONS = [
  { id: 'any',    label: 'Any',    emoji: '✨' },
  { id: 'savory', label: 'Savory', emoji: '🧂' },
  { id: 'sweet',  label: 'Sweet',  emoji: '🍯' },
  { id: 'spicy',  label: 'Spicy',  emoji: '🌶️' },
  { id: 'sour',   label: 'Sour',   emoji: '🍋' },
  { id: 'light',  label: 'Light',  emoji: '🫧' },
];

const QUICK_ADD = ['🥚 Eggs', '🍅 Tomatoes', '🧄 Garlic', '🍗 Chicken', '🧅 Onion', '🧀 Cheese', '🍋 Lemon', '🥦 Broccoli'];

let _nextId = 1;
function nextId() { return String(_nextId++); }

export default function CreateScreen() {
  const navigation               = useNavigation<any>();
  const { openCamera, openGallery, isProcessing } = useCamera();
  const { generate, isLoading }  = useRecipes();

  // Ingredient state
  const [haveItems, setHaveItems]   = useState<IngredientItem[]>([]);
  const [avoidItems, setAvoidItems] = useState<IngredientItem[]>([]);
  const [inputVal, setInputVal]     = useState('');
  const [avoidVal, setAvoidVal]     = useState('');
  const [activeInput, setActiveInput] = useState<'have' | 'avoid'>('have');

  // Filter state
  const [recipeType, setRecipeType] = useState<RecipeType>('food');
  const [cuisine, setCuisine]       = useState('any');
  const [taste, setTaste]           = useState('any');
  const [timeLimit, setTimeLimit]   = useState(30);
  const [missingLimit, setMissingLimit] = useState(3);

  // Camera modal
  const [cameraModalVisible, setCameraModalVisible] = useState(false);

  // ── Ingredient management ──────────────────────────────────

  const addIngredient = useCallback((name: string, image: string | null = null) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const item: IngredientItem = { id: nextId(), name: trimmed, image };
    if (activeInput === 'have') {
      setHaveItems(p => [...p, item]);
      setInputVal('');
    } else {
      setAvoidItems(p => [...p, item]);
      setAvoidVal('');
    }
  }, [activeInput]);

  const handleCamera = useCallback(async () => {
    setCameraModalVisible(false);
    const captured = await openCamera();
    if (captured) addIngredient(captured.name, captured.uri);
  }, [openCamera, addIngredient]);

  const handleGallery = useCallback(async () => {
    setCameraModalVisible(false);
    const captured = await openGallery();
    if (captured) addIngredient(captured.name, captured.uri);
  }, [openGallery, addIngredient]);

  // ── Generation ────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (haveItems.length === 0) return;

    const context: GenerationContext = {
      recipe_type:       recipeType,
      ingredients_have:  haveItems.map(i => i.name),
      ingredients_avoid: avoidItems.map(i => i.name),
      missing_limit:     missingLimit,
      taste,
      cuisine,
      time_limit:  timeLimit,
      difficulty:  'easy',
      allow_alcohol: true,
    };

    await generate(context, 'new');
    navigation.navigate('Recipe');
  }, [haveItems, avoidItems, recipeType, cuisine, taste, timeLimit, missingLimit, generate, navigation]);

  const canGenerate = haveItems.length > 0 && !isLoading && !isProcessing;

  // ── Render ────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🍳</Text>
            <Text style={styles.title}>FridgeChef</Text>
            <Text style={styles.subtitle}>What's in your kitchen?</Text>
          </View>

          {/* Recipe type */}
          <Card style={styles.section}>
            <SectionHeader title="What are you making?" />
            <View style={styles.typeRow}>
              {RECIPE_TYPES.map(t => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setRecipeType(t.id as RecipeType)}
                  style={[
                    styles.typeBtn,
                    recipeType === t.id && styles.typeBtnActive,
                  ]}
                  activeOpacity={0.75}
                >
                  <Text style={styles.typeEmoji}>{t.emoji}</Text>
                  <Text style={[styles.typeLabel, recipeType === t.id && styles.typeLabelActive]}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Ingredients have */}
          <Card style={styles.section}>
            <SectionHeader
              title="📦 Ingredients You Have"
              subtitle="Type or snap a photo"
            />
            <View style={styles.inputRow}>
              <TextInput
                value={inputVal}
                onChangeText={setInputVal}
                onFocus={() => setActiveInput('have')}
                onSubmitEditing={() => addIngredient(inputVal)}
                placeholder="e.g. eggs, tomatoes…"
                placeholderTextColor={Colors.textMuted}
                style={styles.textInput}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => addIngredient(inputVal)}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnLabel}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setActiveInput('have'); setCameraModalVisible(true); }}
                style={styles.cameraBtn}
              >
                <Text style={styles.cameraBtnLabel}>📷</Text>
              </TouchableOpacity>
            </View>
            {haveItems.length > 0 && (
              <View style={styles.tagWrap}>
                {haveItems.map(item => (
                  <IngredientTag
                    key={item.id}
                    name={item.name}
                    image={item.image}
                    onRemove={() => setHaveItems(p => p.filter(i => i.id !== item.id))}
                  />
                ))}
              </View>
            )}
            {haveItems.length === 0 && (
              <Text style={styles.emptyHint}>Add at least one ingredient to get started</Text>
            )}
          </Card>

          {/* Ingredients avoid */}
          <Card style={styles.section}>
            <SectionHeader title="🚫 Avoid" subtitle="Allergies, dislikes" />
            <View style={styles.inputRow}>
              <TextInput
                value={avoidVal}
                onChangeText={setAvoidVal}
                onFocus={() => setActiveInput('avoid')}
                onSubmitEditing={() => addIngredient(avoidVal)}
                placeholder="e.g. nuts, dairy…"
                placeholderTextColor={Colors.textMuted}
                style={styles.textInput}
                returnKeyType="done"
              />
              <TouchableOpacity
                onPress={() => addIngredient(avoidVal)}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnLabel}>+</Text>
              </TouchableOpacity>
            </View>
            {avoidItems.length > 0 && (
              <View style={styles.tagWrap}>
                {avoidItems.map(item => (
                  <IngredientTag
                    key={item.id}
                    name={item.name}
                    isAvoid
                    onRemove={() => setAvoidItems(p => p.filter(i => i.id !== item.id))}
                  />
                ))}
              </View>
            )}
          </Card>

          {/* Cuisine */}
          {recipeType !== 'smoothie' && (
            <Card style={styles.section}>
              <SectionHeader title="🌍 Cuisine" />
              <View style={styles.chipWrap}>
                {CUISINE_OPTIONS.map(o => (
                  <Chip
                    key={o.id}
                    label={o.label}
                    emoji={o.emoji}
                    active={cuisine === o.id}
                    onPress={() => setCuisine(o.id)}
                  />
                ))}
              </View>
            </Card>
          )}

          {/* Taste */}
          <Card style={styles.section}>
            <SectionHeader title="👅 Taste" />
            <View style={styles.chipWrap}>
              {TASTE_OPTIONS.map(o => (
                <Chip
                  key={o.id}
                  label={o.label}
                  emoji={o.emoji}
                  active={taste === o.id}
                  onPress={() => setTaste(o.id)}
                  color="#d4aaff"
                />
              ))}
            </View>
          </Card>

          {/* Constraints */}
          {recipeType === 'food' && (
            <Card style={styles.section}>
              <SectionHeader title="⚙️ Constraints" />
              <View style={styles.constraintRow}>
                <View style={styles.stepper}>
                  <Text style={styles.stepperLabel}>Max time (min)</Text>
                  <View style={styles.stepperControls}>
                    <TouchableOpacity
                      onPress={() => setTimeLimit(t => Math.max(10, t - 5))}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperBtnLabel}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{timeLimit}</Text>
                    <TouchableOpacity
                      onPress={() => setTimeLimit(t => Math.min(180, t + 5))}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperBtnLabel}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.stepper}>
                  <Text style={styles.stepperLabel}>Missing limit</Text>
                  <View style={styles.stepperControls}>
                    <TouchableOpacity
                      onPress={() => setMissingLimit(m => Math.max(0, m - 1))}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperBtnLabel}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{missingLimit}</Text>
                    <TouchableOpacity
                      onPress={() => setMissingLimit(m => Math.min(10, m + 1))}
                      style={styles.stepperBtn}
                    >
                      <Text style={styles.stepperBtnLabel}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Card>
          )}

          {/* Generate */}
          <View style={styles.generateWrap}>
            <GoldButton
              label={isLoading ? 'Generating…' : 'Generate Recipe'}
              emoji={isLoading ? undefined : '✨'}
              onPress={handleGenerate}
              disabled={!canGenerate}
              loading={isLoading}
            />
          </View>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Camera Source Modal */}
      <Modal
        visible={cameraModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCameraModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setCameraModalVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Ingredient Photo</Text>
            <TouchableOpacity style={styles.modalOption} onPress={handleCamera}>
              <Text style={styles.modalOptionEmoji}>📷</Text>
              <Text style={styles.modalOptionLabel}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleGallery}>
              <Text style={styles.modalOptionEmoji}>🖼️</Text>
              <Text style={styles.modalOptionLabel}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalOption, { borderTopWidth: 1, borderTopColor: Colors.borderSubtle }]}
              onPress={() => setCameraModalVisible(false)}
            >
              <Text style={[styles.modalOptionLabel, { color: Colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: Colors.bg0 },
  scroll:  { flex: 1 },
  content: { padding: Spacing.md, gap: Spacing.md },

  header: {
    alignItems:   'center',
    paddingTop:   Spacing.lg,
    paddingBottom: Spacing.md,
  },
  logo:     { fontSize: 44, marginBottom: 6 },
  title:    { ...Typography.displayL, color: Colors.gold, marginBottom: 4 },
  subtitle: { ...Typography.bodyM, color: Colors.textMuted },

  section: { gap: 0 },

  typeRow:       { flexDirection: 'row', gap: Spacing.sm },
  typeBtn: {
    flex:            1,
    alignItems:      'center',
    paddingVertical: Spacing.md,
    borderRadius:    Radius.md,
    backgroundColor: Colors.bg3,
    borderWidth:     1,
    borderColor:     Colors.borderSubtle,
    gap:             4,
  },
  typeBtnActive: {
    backgroundColor: Colors.goldGlow,
    borderColor:     Colors.borderGold,
  },
  typeEmoji:      { fontSize: 24 },
  typeLabel:      { ...Typography.labelM, color: Colors.textMuted },
  typeLabelActive: { color: Colors.gold },

  inputRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  textInput: {
    flex:              1,
    backgroundColor:   Colors.bg3,
    borderRadius:      Radius.sm,
    borderWidth:       1,
    borderColor:       Colors.borderSubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical:   11,
    color:             Colors.textPrimary,
    ...Typography.bodyM,
  },
  addBtn: {
    width:           44,
    height:          44,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.goldGlow,
    borderWidth:     1,
    borderColor:     Colors.borderGold,
    alignItems:      'center',
    justifyContent:  'center',
  },
  addBtnLabel:    { color: Colors.gold, fontSize: 22, lineHeight: 26 },
  cameraBtn: {
    width:           44,
    height:          44,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.bg3,
    borderWidth:     1,
    borderColor:     Colors.borderSubtle,
    alignItems:      'center',
    justifyContent:  'center',
  },
  cameraBtnLabel: { fontSize: 20 },

  tagWrap:   { flexDirection: 'row', flexWrap: 'wrap', marginTop: Spacing.sm },
  emptyHint: { ...Typography.bodyS, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.sm },

  chipWrap:  { flexDirection: 'row', flexWrap: 'wrap', margin: -3 },

  constraintRow: { flexDirection: 'row', gap: Spacing.xl },
  stepper:       { flex: 1, gap: Spacing.sm },
  stepperLabel:  { ...Typography.labelS, color: Colors.textMuted, textTransform: 'uppercase' },
  stepperControls: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepperBtn: {
    width:           30,
    height:          30,
    borderRadius:    Radius.sm,
    backgroundColor: Colors.bg3,
    borderWidth:     1,
    borderColor:     Colors.borderMid,
    alignItems:      'center',
    justifyContent:  'center',
  },
  stepperBtnLabel: { color: Colors.textSecondary, fontSize: 18, lineHeight: 20 },
  stepperValue:    { ...Typography.bodyL, color: Colors.gold, minWidth: 28, textAlign: 'center' },

  generateWrap: { marginTop: Spacing.sm },

  // Modal
  modalOverlay: {
    flex:            1,
    backgroundColor: Colors.overlay,
    justifyContent:  'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.bg1,
    borderTopLeftRadius:  Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding:        Spacing.lg,
    paddingBottom:  Spacing.xxl,
    gap:            Spacing.sm,
  },
  modalHandle: {
    width:           40,
    height:          4,
    borderRadius:    2,
    backgroundColor: Colors.borderMid,
    alignSelf:       'center',
    marginBottom:    Spacing.md,
  },
  modalTitle: {
    ...Typography.displayM,
    color:        Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  modalOption: {
    flexDirection:  'row',
    alignItems:     'center',
    gap:            Spacing.md,
    paddingVertical: Spacing.md,
  },
  modalOptionEmoji: { fontSize: 24 },
  modalOptionLabel: { ...Typography.bodyL, color: Colors.textPrimary },
});
