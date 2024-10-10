const { withDangerousMod, withXcodeProject } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function addRubyScriptToXcodeProject(config) {
  return withXcodeProject(config, (config) => {
    const xcodeProject = config.modResults;
    const projectRoot = config.modRequest.projectRoot;
    const filePath = path.join(projectRoot, 'ios', 'AppLovinQualityServiceSetup-ios.rb');
    
    xcodeProject.addResourceFile(filePath, { target: 'DoubleDeckPinochle' });
    
    return config;
  });
}

module.exports = function withAppLovinPodfile(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const filePath = path.join(
        config.modRequest.platformProjectRoot,
        'Podfile',
      )

      let contents = fs.readFileSync(filePath, 'utf-8')

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
      contents = contents.replace(/end[\n ]*?$/g, `${appLovinPods}\n${appLovinSetup}\nend`)

      fs.writeFileSync(filePath, contents)

      // Add Ruby script to Xcode project
      config = addRubyScriptToXcodeProject(config);

      return config
    },
  ])
}
