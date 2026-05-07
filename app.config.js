// app.config.js — replaces app.json
// Reads ANTHROPIC_API_KEY from .env via process.env
// Never hardcode keys in source files.

module.exports = {
  expo: {
    name: "FridgeChef",
    slug: "fridgechef",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    splash: { backgroundColor: "#0d0f0a" },

    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.fridgechef.app",
      infoPlist: {
        NSCameraUsageDescription: "FridgeChef uses your camera to identify ingredients.",
        NSPhotoLibraryUsageDescription: "FridgeChef reads photos to identify ingredients.",
      },
    },
    android: {
      adaptiveIcon: { backgroundColor: "#0d0f0a" },
      package: "com.fridgechef.app",
      permissions: ["CAMERA", "READ_EXTERNAL_STORAGE"],
    },
    plugins: ["expo-camera", "expo-image-picker"],

    // ── Env vars injected here — safe to commit this file ──
    extra: {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? null,
    },
  },
};
