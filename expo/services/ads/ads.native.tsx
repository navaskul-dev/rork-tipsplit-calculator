import React, { useState } from "react";
import { Platform } from "react-native";
import MobileAds, {
  InterstitialAd,
  AdEventType,
  BannerAd,
  BannerAdSize,
} from "react-native-google-mobile-ads";
import AppLovinMAX, { InterstitialAd as MaxInterstitial } from "react-native-applovin-max";
import * as TrackingTransparency from "expo-tracking-transparency";
import {
  ADS_ENABLED,
  ADMOB_BANNER_UNIT_ID,
  ADMOB_INTERSTITIAL_UNIT_ID,
  APPLOVIN_SDK_KEY,
  APPLOVIN_INTERSTITIAL_UNIT_ID,
} from "@/constants/ads";

/**
 * Native implementation of the ad bridge (iOS + Android only).
 * Metro picks this file over `ads.ts` on native platforms via the
 * `.native` extension.
 */

export const adsSupported: boolean = ADS_ENABLED;

let interstitialRef: InterstitialAd | null = null;
let admobInterstitialReady = false;

function loadAdMobInterstitial(): void {
  try {
    const ad = InterstitialAd.createForAdRequest(ADMOB_INTERSTITIAL_UNIT_ID);
    ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log("[Ads] AdMob interstitial loaded");
      admobInterstitialReady = true;
    });
    ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log("[Ads] AdMob interstitial closed");
      admobInterstitialReady = false;
      ad.load();
    });
    ad.addAdEventListener(AdEventType.ERROR, () => {
      console.log("[Ads] AdMob interstitial failed to load");
      admobInterstitialReady = false;
    });
    ad.load();
    interstitialRef = ad;
  } catch (err) {
    console.log("[Ads] AdMob interstitial setup failed:", err);
  }
}

export async function initializeAds(): Promise<boolean> {
  if (!ADS_ENABLED) return false;
  try {
    // iOS: ask for tracking permission first so ads can be personalized.
    if (Platform.OS === "ios") {
      const status = await TrackingTransparency.getTrackingPermissionsAsync();
      if (status.status === "undetermined") {
        await TrackingTransparency.requestTrackingPermissionsAsync();
      }
    }

    await MobileAds().initialize();
    console.log("[Ads] AdMob initialized");

    if (APPLOVIN_SDK_KEY) {
      await AppLovinMAX.initialize(APPLOVIN_SDK_KEY);
      console.log("[Ads] AppLovin MAX initialized");
      if (APPLOVIN_INTERSTITIAL_UNIT_ID) {
        MaxInterstitial.loadAd(APPLOVIN_INTERSTITIAL_UNIT_ID);
      }
    }

    loadAdMobInterstitial();
    return true;
  } catch (err) {
    console.log("[Ads] Initialization failed:", err);
    return false;
  }
}

export async function tryShowInterstitial(): Promise<boolean> {
  if (!ADS_ENABLED) return false;

  // Prefer AdMob; fall back to AppLovin MAX when AdMob isn't ready.
  if (admobInterstitialReady && interstitialRef) {
    try {
      await interstitialRef.show();
      console.log("[Ads] Showed AdMob interstitial");
      return true;
    } catch (err) {
      console.log("[Ads] AdMob show failed:", err);
    }
  }

  if (APPLOVIN_INTERSTITIAL_UNIT_ID) {
    try {
      const ready = await MaxInterstitial.isAdReady(APPLOVIN_INTERSTITIAL_UNIT_ID);
      if (ready) {
        MaxInterstitial.showAd(APPLOVIN_INTERSTITIAL_UNIT_ID);
        console.log("[Ads] Showed AppLovin interstitial");
        return true;
      }
      MaxInterstitial.loadAd(APPLOVIN_INTERSTITIAL_UNIT_ID);
    } catch (err) {
      console.log("[Ads] AppLovin show failed:", err);
    }
  }

  return false;
}

/** Renders a bottom banner ad, or null when ads are unavailable. */
export function AdBannerView() {
  const [failed, setFailed] = useState<boolean>(false);

  if (!ADS_ENABLED || failed) return null;

  return (
    <BannerAd
      unitId={ADMOB_BANNER_UNIT_ID}
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      onAdFailedToLoad={(error) => {
        console.log("[Ads] Banner failed to load:", error?.message);
        setFailed(true);
      }}
    />
  );
}
