const { withDangerousMod, withXcodeProject, withInfoPlist } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function modifyPodfile(contents) {
  // Add AppLovin SDK and mediation pods to the Podfile
  const appLovinPods = `
  pod 'AppLovinSDK'
  pod 'AppLovinMediationGoogleAdapter'
  pod 'AppLovinMediationUnityAdsAdapter'
  pod 'AppLovinMediationVungleAdapter'
  pod 'AppLovinMediationInMobiAdapter'
`

  // Find the existing post_install hook
  const postInstallRegex = /post_install\s+do\s+\|installer\|([\s\S]*?)end/;
  const match = contents.match(postInstallRegex);

  if (match) {
    // If there's an existing post_install hook, add our command to it
    const existingHook = match[1];
    const newHook = `${existingHook}
    system("ruby \#{Dir.pwd}/AppLovinQualityServiceSetup-ios.rb")`;
    return contents.replace(postInstallRegex, `post_install do |installer|${newHook}\nend`) + appLovinPods;
  } else {
    // If there's no existing post_install hook, add a new one
    const appLovinSetup = `
post_install do |installer|
  system("ruby \#{Dir.pwd}/AppLovinQualityServiceSetup-ios.rb")
end
`
    return contents + appLovinPods + appLovinSetup;
  }
}

function withAdMobAppId(config, admobAppId) {
  return withInfoPlist(config, config => {
    if (admobAppId) {
      config.modResults.GADApplicationIdentifier = admobAppId;
    }
    return config;
  });
}

module.exports = function withAppLovinPodfile(config, data) {
  // First, modify the Podfile
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      )

      let contents = fs.readFileSync(filePath, 'utf-8')
      contents = modifyPodfile(contents)
      fs.writeFileSync(filePath, contents)

      return config
    },
  ])

  // Then, modify the Xcode project
  config = withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    
    console.log('Project root:', projectRoot);
    console.log('Xcode project:', xcodeProject ? 'Loaded' : 'Not loaded');

    if (!xcodeProject) {
      console.error('Xcode project not loaded correctly');
      return config;
    }

    const filePath = path.join(projectRoot, 'ios', 'AppLovinQualityServiceSetup-ios.rb');
    console.log('Ruby script path:', filePath);
    console.log('Ruby script exists:', fs.existsSync(filePath));

    if (!fs.existsSync(filePath)) {
      console.error('Ruby script file does not exist');
      return config;
    }

    try {
      xcodeProject.addResourceFile(filePath, { target: 'DoubleDeckPinochle' });
      console.log('Resource file added successfully');
    } catch (error) {
      console.error('Error adding resource file:', error);
    }
    
    return config;
  });

  // Add this line to apply the AdMob App ID modification
  config = withAdMobAppId(config, data.admobAppId);

  return config;
};
