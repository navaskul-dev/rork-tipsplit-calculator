import { useState, useEffect, useCallback, useRef } from "react";
import createContextHook from "@nkzw/create-context-hook";
import {
  adsSupported,
  initializeAds,
  tryShowInterstitial,
} from "@/services/ads/ads";
import { INTERSTITIAL_FREQUENCY } from "@/constants/ads";

export const [AdsProvider, useAds] = createContextHook(() => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const adShowCounter = useRef<number>(0);

  // Initialize the ad SDKs once per app launch.
  useEffect(() => {
    if (!adsSupported || initialized) return;

    let cancelled = false;
    initializeAds().then((ok) => {
      if (ok && !cancelled) {
        setInitialized(true);
        console.log("[Ads] Ready");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [initialized]);

  const maybeShowInterstitial = useCallback(async () => {
    if (!adsSupported || !initialized) return;

    adShowCounter.current += 1;
    if (adShowCounter.current % INTERSTITIAL_FREQUENCY !== 0) return;

    await tryShowInterstitial();
  }, [initialized]);

  return {
    adsSupported,
    initialized,
    maybeShowInterstitial,
  };
});
