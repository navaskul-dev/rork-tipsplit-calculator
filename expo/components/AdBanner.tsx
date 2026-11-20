import React, { useState } from "react";
import { View } from "react-native";
import { BannerAd, BannerAdSize } from "react-native-google-mobile-ads";
import { ADS_ENABLED, ADMOB_BANNER_UNIT_ID } from "@/constants/ads";

/**
 * Bottom anchor banner. Renders nothing when ads are disabled
 * (web, Expo Go, or no AdMob App ID configured) or when the ad fails
 * to load, so the layout never shows an empty block.
 */
export default function AdBanner() {
  const [failed, setFailed] = useState<boolean>(false);

  if (!ADS_ENABLED || failed) return null;

  return (
    <View style={{ marginVertical: 4 }}>
      <BannerAd
        unitId={ADMOB_BANNER_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        onAdFailedToLoad={(error) => {
          console.log("[Ads] Banner failed to load:", error?.message);
          setFailed(true);
        }}
      />
    </View>
  );
}
