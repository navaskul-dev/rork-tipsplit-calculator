import { Platform } from "react-native";

/**
 * Ad configuration.
 *
 * Values come from public environment variables so real IDs can be added
 * without code changes. Until real IDs are provided, Google's official
 * public TEST ad unit IDs are used (they always return test ads).
 */

// AdMob App ID (goes into the native build config — NOT an ad unit ID).
export const ADMOB_APP_ID = process.env.EXPO_PUBLIC_ADMOB_APP_ID ?? "";

// Ad unit IDs (created in the AdMob dashboard).
export const ADMOB_BANNER_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID ??
  (Platform.OS === "ios"
    ? "ca-app-pub-3940256099942544/2934735716" // test banner (iOS)
    : "ca-app-pub-3940256099942544/6300978111"); // test banner (Android)

export const ADMOB_INTERSTITIAL_UNIT_ID =
  process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID ??
  (Platform.OS === "ios"
    ? "ca-app-pub-3940256099942544/441146891" // test interstitial (iOS)
    : "ca-app-pub-3940256099942544/1033173712"); // test interstitial (Android)

// AppLovin MAX SDK key (Account > General > Keys in the AppLovin dashboard).
export const APPLOVIN_SDK_KEY = process.env.EXPO_PUBLIC_APPLOVIN_SDK_KEY ?? "";
export const APPLOVIN_INTERSTITIAL_UNIT_ID =
  process.env.EXPO_PUBLIC_APPLOVIN_INTERSTITIAL_UNIT_ID ?? "";

/**
 * Whether the ad SDKs can be activated. AdMob requires its App ID to be
 * present in the native build; without it we keep every SDK call disabled
 * so the app runs clean in Expo Go / web and in builds without ad config.
 */
export const ADS_ENABLED =
  Platform.OS !== "web" && ADMOB_APP_ID.trim().length > 0;

// Show an interstitial after every Nth saved calculation.
export const INTERSTITIAL_FREQUENCY = 3;
