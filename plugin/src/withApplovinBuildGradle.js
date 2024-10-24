// update root level build.gradle file (module:project)
const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withApplovinProjectGradle(config) {
  return withProjectBuildGradle(config, (config) => {
    config.modResults = addAppLovinMaven(config.modResults);
    config.modResults = addAppLovinClasspath(config.modResults);
    return config;
  });
};

function addAppLovinMaven(gradle) {
  const repositoriesPattern = /repositories\s*{([\s\S]*?)}/;
  const applovinRepository = "maven { url 'https://artifacts.applovin.com/android' }";

  const repositoriesBlock = gradle.contents.match(repositoriesPattern);
  if (repositoriesBlock) {
    const existingRepositories = repositoriesBlock[1];

    // Add AppLovin repositories if they don't already exist
    let newRepositories = existingRepositories;

    if (!existingRepositories.includes(applovinRepository)) {
      newRepositories += `    ${applovinRepository}\n`;
    }

    gradle.contents = gradle.contents.replace(
      repositoriesPattern,
      `repositories {\n${newRepositories}}`
    );
  } else {
    // If no repositories block exists, add one with the necessary repositories
    gradle.contents += `
repositories {
    google()
    mavenCentral()
    maven { url "https://maven.ogury.co" }
    ${applovinRepository}
}
`;
  }

  return gradle;
}

function addAppLovinClasspath(gradle) {
  const dependenciesPattern = /dependencies\s*{([\s\S]*?)}/;
  const appLovinClasspath = `classpath "com.applovin.quality:AppLovinQualityServiceGradlePlugin:+"`;

  if (gradle.contents.includes(appLovinClasspath)) {
    return gradle;
  }

  gradle.contents = gradle.contents.replace(
    dependenciesPattern,
    (match, group1) => {
      return match.replace(group1, group1 + `    ${appLovinClasspath}\n`);
    },
  );
  return gradle;
}
