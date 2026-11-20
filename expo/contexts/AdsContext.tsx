import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import MobileAds, { InterstitialAd, AdEventType } from "react-native-google-mobile-ads";
import AppLovinMAX, { InterstitialAd as MaxInterstitial } from "react-native-applovin-max";
import * as TrackingTransparency from "expo-tracking-transparency";
import createContextHook from "@nkzw/create-context-hook";
import {
  ADS_ENABLED,
  ADMOB_INTERSTITIAL_UNIT_ID,
  APPLOVIN_SDK_KEY,
  APPLOVIN_INTERSTITIAL_UNIT_ID,
  INTERSTITIAL_FREQUENCY,
} from "@/constants/ads";

export const [AdsProvider, useAds] = createContextHook(() => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const [interstitialReady, setInterstitialReady] = useState<boolean>(false);
  const adShowCounter = useRef<number>(0);
  const interstitialRef = useRef<InterstitialAd | null>(null);

  const loadAdMobInterstitial = useCallback(() => {
    try {
      const ad = InterstitialAd.createForAdRequest(ADMOB_INTERSTITIAL_UNIT_ID);
      ad.addAdEventListener(AdEventType.LOADED, () => {
        console.log("[Ads] AdMob interstitial loaded");
        setInterstitialReady(true);
      });
      ad.addAdEventListener(AdEventType.CLOSED, () => {
        console.log("[Ads] AdMob interstitial closed");
        setInterstitialReady(false);
        ad.load();
      });
      ad.addAdEventListener(AdEventType.ERROR, () => {
        console.log("[Ads] AdMob interstitial failed to load");
        setInterstitialReady(false);
      });
      ad.load();
      interstitialRef.current = ad;
    } catch (err) {
      console.log("[Ads] AdMob interstitial setup failed:", err);
    }
  }, []);

  const loadAppLovinInterstitial = useCallback(() => {
    if (!APPLOVIN_INTERSTITIAL_UNIT_ID) return;
    try {
      MaxInterstitial.loadAd(APPLOVIN_INTERSTITIAL_UNIT_ID);
      console.log("[Ads] AppLovin interstitial load requested");
    } catch (err) {
      console.log("[Ads] AppLovin load failed:", err);
    }
  }, []);

  // Initialize the ad SDKs once per app launch.
  useEffect(() => {
    if (!ADS_ENABLED || initialized) return;

    let cancelled = false;
    (async () => {
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
          loadAppLovinInterstitial();
        }

        loadAdMobInterstitial();
        if (!cancelled) setInitialized(true);
      } catch (err) {
        console.log("[Ads] Initialization failed:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [initialized, loadAdMobInterstitial, loadAppLovinInterstitial]);

  const maybeShowInterstitial = useCallback(async () => {
    if (!ADS_ENABLED || !initialized) return;

    adShowCounter.current += 1;
    if (adShowCounter.current % INTERSTITIAL_FREQUENCY !== 0) return;

    // Prefer AdMob; fall back to AppLovin MAX when AdMob isn't ready.
    const admobAd = interstitialRef.current;
    if (interstitialReady && admobAd) {
      try {
        await admobAd.show();
        console.log("[Ads] Showed AdMob interstitial");
        return;
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
        }
        loadAppLovinInterstitial();
      } catch (err) {
        console.log("[Ads] AppLovin show failed:", err);
      }
    }
  }, [initialized, interstitialReady, loadAppLovinInterstitial]);

  return {
    adsSupported: ADS_ENABLED,
    initialized,
    interstitialReady,
    maybeShowInterstitial,
  };
});
