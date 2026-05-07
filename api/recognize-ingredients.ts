// ─────────────────────────────────────────────
// Vercel Serverless Function
// POST /api/recognize-ingredients
//
// Receives:
//   - imageBase64: string (base64-encoded image)
//   - recipeType: 'food' | 'smoothie' | 'cocktail'
//
// Returns:
//   - suggestions: IngredientSuggestion[]
//     [{ name, confidence, fromCamera: true }]
//
// Auth:
//   - ANTHROPIC_API_KEY from process.env (backend-only)
//   - No key passed from client
// ─────────────────────────────────────────────

import { VercelRequest, VercelResponse } from '@vercel/node';

interface RecognizeRequest {
  imageBase64: string;
  recipeType: string;
}

interface IngredientSuggestion {
  name: string;
  confidence: number;
  fromCamera: boolean;
}

interface RecognizeResponse {
  suggestions: IngredientSuggestion[];
  error?: string;
}

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';

async function callClaudeVision(
  imageBase64: string,
  recipeType: string
): Promise<IngredientSuggestion[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set in Vercel environment');
  }

  // Build the vision prompt based on recipe type
  const prompt = buildVisionPrompt(recipeType);

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Claude API error ${res.status}: ${error}`);
  }

  const data = await res.json();
  const responseText = data.content?.[0]?.text ?? '';

  // Parse the response as JSON
  try {
    const parsed = JSON.parse(responseText);
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }
    // Map to IngredientSuggestion format
    return parsed.map((item: any) => ({
      name: item.name ?? item.ingredient ?? 'unknown',
      confidence: Math.min(1, Math.max(0, item.confidence ?? 0.7)),
      fromCamera: true,
    }));
  } catch (e) {
    console.error('Failed to parse Claude response:', responseText, e);
    // Return empty suggestions on parse error
    return [];
  }
}

function buildVisionPrompt(recipeType: string): string {
  const recipeContext =
    recipeType === 'smoothie'
      ? 'blender drink ingredients'
      : recipeType === 'cocktail'
        ? 'cocktail/drink ingredients'
        : 'cooking ingredients';

  return `You are analyzing a photo to identify ${recipeContext}.

List all visible ingredients in the image as a JSON array.

Each item should have:
- "name": ingredient name (lowercase, singular)
- "confidence": 0.0–1.0 (how sure you are)

Example output:
[
  { "name": "tomato", "confidence": 0.95 },
  { "name": "basil", "confidence": 0.8 },
  { "name": "onion", "confidence": 0.7 }
]

Return ONLY valid JSON, no markdown, no explanation.`;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse<RecognizeResponse>
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ suggestions: [], error: 'Method not allowed' });
    return;
  }

  try {
    const { imageBase64, recipeType } = req.body as RecognizeRequest;

    // Validate input
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      res.status(400).json({ suggestions: [], error: 'Missing imageBase64' });
      return;
    }

    if (!recipeType || !['food', 'smoothie', 'cocktail'].includes(recipeType)) {
      res.status(400).json({ suggestions: [], error: 'Invalid recipeType' });
      return;
    }

    // Call Claude Vision
    const suggestions = await callClaudeVision(imageBase64, recipeType);

    res.status(200).json({ suggestions });
  } catch (error: any) {
    console.error('Recognition error:', error);
    res.status(500).json({
      suggestions: [],
      error: error?.message ?? 'Internal server error',
    });
  }
}
