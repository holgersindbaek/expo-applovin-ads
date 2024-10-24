// update app level build.gradle file (module:app)

const { withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withApplovinGradle(config, data) {
  return withAppBuildGradle(config, (config) => {
    config.modResults = addAppLovinApiKey(config.modResults, data.apiKey);
    return config;
  });
};

function addAppLovinApiKey(gradle, apiKey) {
  const appLovinPlugin = `\n\napply plugin: 'applovin-quality-service'`;
  const appLovinPattern = /\napplovin\s*{([\s\S]*?)}\n/;
  const appLovinApiKey = `\napplovin {\n    apiKey "${apiKey}"\n}\n`;

  if (!gradle.contents.includes(appLovinPlugin)) {
    gradle.contents += appLovinPlugin;
  }

  gradle.contents = gradle.contents.replace(appLovinPattern, "");

  gradle.contents = gradle.contents.replace(
    /(dependencies {[\w\W]+?)(?<=\n)}/,
    `$1
    implementation 'com.applovin:applovin-sdk:+'
    implementation 'com.applovin.mediation:google-ad-manager-adapter:+'
    implementation 'com.applovin.mediation:google-adapter:+'
    implementation 'com.applovin.mediation:inmobi-adapter:+'
    implementation 'com.squareup.picasso:picasso:2.71828'
    implementation 'androidx.recyclerview:recyclerview:1.1.0'
    implementation 'com.applovin.mediation:vungle-adapter:+'
    implementation 'com.applovin.mediation:unityads-adapter:+'
    implementation 'com.applovin.mediation:ogury-presage-adapter:+'
}`,
  );

  gradle.contents = gradle.contents.replace(
    appLovinPlugin,
    appLovinPlugin + `${appLovinApiKey}`,
  );

  gradle.contents = gradle.contents.replace(
    /(android {[\w\W]+?)(compileSdkVersion\s+\d+)/,
    `$1
    compileSdkVersion 31
    `,
  );

  return gradle;
}
