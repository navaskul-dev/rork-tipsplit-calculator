import type { ComponentType } from "react";

/**
 * Generic (web / type-check base) implementation of the ad bridge.
 * On iOS and Android, Metro resolves `ads.native.ts` instead, which holds
 * the real AdMob + AppLovin MAX logic. This file never imports the ad
 * SDKs, so web bundles stay free of native-only modules.
 */

export type AdBannerComponent = ComponentType<Record<string, never>> | null;

export const adsSupported: boolean = false;

/** Initialize ad SDKs. Resolves to true when ads are active. */
export async function initializeAds(): Promise<boolean> {
  return false;
}

/** Try to show a ready interstitial (AdMob first, then AppLovin MAX). */
export async function tryShowInterstitial(): Promise<boolean> {
  return false;
}

/** Renders a bottom banner ad, or null when ads are unavailable. */
export const AdBannerView: AdBannerComponent = null;
