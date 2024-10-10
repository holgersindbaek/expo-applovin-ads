const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
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

  const appLovinSetup = `
post_install do |installer|
  system("ruby \#{Dir.pwd}/AppLovinQualityServiceSetup-ios.rb")
end
`

  // Replace the last 'end' in the Podfile with the AppLovin pods and setup
  return contents.replace(/end[\n ]*?$/g, `${appLovinPods}\n${appLovinSetup}\nend`)
}

module.exports = function withAppLovinPodfile(config) {
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
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const filePath = path.join(projectRoot, 'ios', 'AppLovinQualityServiceSetup-ios.rb');
    
    xcodeProject.addResourceFile(filePath, { target: 'DoubleDeckPinochle' });
    
    return config;
  });
}
