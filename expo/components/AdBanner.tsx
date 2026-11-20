import React from "react";
import { View } from "react-native";
import { AdBannerView } from "@/services/ads/ads";

/**
 * Bottom banner ad. Renders nothing when ads are unavailable
 * (web, Expo Go, or no AdMob App ID configured) or when the ad fails
 * to load, so the layout never shows an empty block.
 */
export default function AdBanner() {
  const BannerView = AdBannerView;
  if (!BannerView) return null;

  return (
    <View style={{ marginVertical: 4 }}>
      <BannerView />
    </View>
  );
}
