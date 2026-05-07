// ─────────────────────────────────────────────
// DESIGN TOKENS — FridgeChef Premium Dark Theme
// Single source of truth. Import everywhere.
// ─────────────────────────────────────────────

export const Colors = {
  // Backgrounds — layered depth
  bg0:  '#0d0f0a',   // deepest — screen bg
  bg1:  '#131610',   // cards
  bg2:  '#1a1e16',   // elevated cards
  bg3:  '#21261d',   // inputs, chips

  // Gold accent spectrum
  gold:       '#c9a84c',
  goldLight:  '#e8c96a',
  goldDim:    '#8a6e2f',
  goldGlow:   'rgba(201,168,76,0.15)',

  // Text
  textPrimary:   '#f2ede4',
  textSecondary: 'rgba(242,237,228,0.55)',
  textMuted:     'rgba(242,237,228,0.28)',

  // Semantic
  success:  '#6db87a',
  danger:   '#c96c5a',
  warning:  '#c9a84c',
  missing:  '#c97a5a',

  // Borders
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderMid:    'rgba(255,255,255,0.10)',
  borderGold:   'rgba(201,168,76,0.30)',

  // Overlays
  overlay:      'rgba(13,15,10,0.85)',
  overlayLight: 'rgba(13,15,10,0.4)',
};

export const Typography = {
  // Display — Playfair Display (elegant, editorial)
  displayXL: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 32, lineHeight: 40 },
  displayL:  { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, lineHeight: 33 },
  displayM:  { fontFamily: 'PlayfairDisplay_600SemiBold', fontSize: 20, lineHeight: 26 },

  // Body — DM Sans (clean, readable)
  bodyL:   { fontFamily: 'DMSans_400Regular', fontSize: 16, lineHeight: 24 },
  bodyM:   { fontFamily: 'DMSans_400Regular', fontSize: 14, lineHeight: 21 },
  bodyS:   { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 18 },
  labelM:  { fontFamily: 'DMSans_500Medium',  fontSize: 13, lineHeight: 18 },
  labelS:  { fontFamily: 'DMSans_500Medium',  fontSize: 11, lineHeight: 15, letterSpacing: 1.2 },
  caption: { fontFamily: 'DMSans_400Regular', fontSize: 11, lineHeight: 15 },
};

export const Spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const Radius = {
  sm:  8,
  md:  14,
  lg:  20,
  xl:  28,
  full: 999,
};

export const Shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  gold: {
    shadowColor: '#c9a84c',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
};
