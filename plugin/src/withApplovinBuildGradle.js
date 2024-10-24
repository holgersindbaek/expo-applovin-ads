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
  const repositoriesPattern = /allprojects\s*{[\s\S]*?repositories\s*{([\s\S]*?)}\s*}/;
  const applovinRepository = "maven { url 'https://artifacts.applovin.com/android' }";
  const oguryRepository = "maven { url 'https://maven.ogury.co' }";
  const jitpackRepository = "maven { url 'https://jitpack.io' }";

  console.log("Current build.gradle contents:");
  console.log(gradle.contents);

  const repositoriesBlock = gradle.contents.match(repositoriesPattern);
  if (repositoriesBlock) {
    let existingRepositories = repositoriesBlock[1];

    if (!existingRepositories.includes(applovinRepository)) {
      existingRepositories += `        ${applovinRepository}\n`;
    }
    if (!existingRepositories.includes(oguryRepository)) {
      existingRepositories += `        ${oguryRepository}\n`;
    }
    if (!existingRepositories.includes(jitpackRepository)) {
      existingRepositories += `        ${jitpackRepository}\n`;
    }

    gradle.contents = gradle.contents.replace(
      repositoriesPattern,
      `allprojects {
    repositories {
${existingRepositories}    }
}`
    );
  } else {
    gradle.contents += `
allprojects {
    repositories {
        google()
        mavenCentral()
        ${oguryRepository}
        ${applovinRepository}
        ${jitpackRepository}
    }
}
`;
  }

  console.log("Updated build.gradle contents:");
  console.log(gradle.contents);

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
