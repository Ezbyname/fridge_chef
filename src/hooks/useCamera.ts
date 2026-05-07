// ─────────────────────────────────────────────
// useCamera v2 — NON-BLOCKING flow
//
// UX pattern:
//   1. take photo → immediately return placeholder tag
//   2. recognition runs in background
//   3. onRecognized(id, suggestion) updates name in place
//
// Feels instant. No "AI waiting" screen.
// ─────────────────────────────────────────────

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { IngredientSuggestion } from '../core/GenerationContext';

export interface CaptureResult {
  uri:         string;
  placeholder: string;
  id:          string;
}

interface UseCameraOptions {
  onRecognized?: (id: string, suggestion: IngredientSuggestion) => void;
}

let _captureId = 0;

export function useCamera({ onRecognized }: UseCameraOptions = {}) {
  const [isCapturing, setCapturing] = useState(false);

  // STUB: replace with real Claude vision call (see README)
  const recognizeIngredient = async (uri: string, filename: string): Promise<IngredientSuggestion> => {
    await new Promise(r => setTimeout(r, 800));
    const name = filename.replace(/\.[^.]+$/, '').replace(/[-_\d]/g, ' ').trim() || 'ingredient';
    return { name, confidence: 0.5, fromCamera: true, imageUri: uri };
  };

  const capture = useCallback(async (source: 'camera' | 'gallery'): Promise<CaptureResult | null> => {
    setCapturing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return null;
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return null;
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
      }

      if (result.canceled || !result.assets?.[0]) return null;

      const asset    = result.assets[0];
      const filename = asset.fileName ?? `photo_${Date.now()}.jpg`;
      const id       = `cap_${++_captureId}`;

      // Return immediately — tag appears at once
      const captureResult: CaptureResult = { uri: asset.uri, placeholder: '…identifying', id };

      // Background recognition — non-blocking
      if (onRecognized) {
        recognizeIngredient(asset.uri, filename)
          .then(suggestion => {
            onRecognized(id, { ...suggestion, imageUri: asset.uri });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          })
          .catch(() => { /* tag stays as placeholder, user can rename */ });
      }

      return captureResult;
    } finally {
      setCapturing(false);
    }
  }, [onRecognized]);

  return { capture, isCapturing };
}
