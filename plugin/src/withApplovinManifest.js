const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function withApplovinManifest(config, data) {
  return withAndroidManifest(config, async (config) => {
    let androidManifest = config.modResults.manifest;

    androidManifest["uses-permission"] = [
      ...androidManifest["uses-permission"],
      {
        $: {
          "android:name": "com.google.android.gms.permission.AD_ID",
        },
      },
      {
        $: {
          "android:name": "android.permission.INTERNET",
        },
      },
      {
        $: {
          "android:name": "android.permission.ACCESS_NETWORK_STATE",
        },
      },
    ];

    // Add Google AdMob App ID metadata
    androidManifest.application[0]["meta-data"] = [
      ...(androidManifest.application[0]["meta-data"] || []),
      {
        $: {
          "android:name": "com.google.android.gms.ads.APPLICATION_ID",
          "android:value": data.admobAppId, // Dynamically set AdMob App ID
        },
      },
    ];

    return config;
  });
};
