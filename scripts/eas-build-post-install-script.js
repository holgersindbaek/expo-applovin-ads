/* eslint-disable no-inner-declarations */
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");

const dir = path.join(__dirname, "../");
if (process.platform !== "darwin")
  console.log(
    "eas-build-post-install-script: no MAC",
    process.cwd(),
    process.platform,
  );
else {
  console.log("RUNNING eas-build-post-install-script!");

  // Log environment variables
  console.log("Environment variables:", JSON.stringify(process.env, null, 2));

  // Log contents of directories
  console.log("Contents of current directory:", fs.readdirSync(process.cwd()));
  console.log("Contents of ios directory:", fs.readdirSync(path.join(process.cwd(), 'ios')));

  // Log full path of this script
  console.log("Full path of this script:", __filename);

  // Log Node.js version
  console.log("Node.js version:", process.version);

  // Log Xcode version
  exec('xcodebuild -version', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`Xcode version: ${stdout}`);
  });

  // Log Ruby version
  exec('ruby -v', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(`Ruby version: ${stdout}`);
  });

  const sourcePath = "./plugin/src";

  const scriptFileName = "AppLovinQualityServiceSetup-ios.rb";

  // We copy the file to the project root
  const newPath = path.join(process.cwd(), "ios", scriptFileName);
  fs.copyFileSync(path.join(dir, sourcePath, scriptFileName), newPath);

  console.log("Current working directory:", process.cwd());
  console.log("New path for Ruby script:", newPath);
  console.log("File exists:", fs.existsSync(newPath));

  // Log contents of the Podfile
  const podfilePath = path.join(process.cwd(), 'ios', 'Podfile');
  if (fs.existsSync(podfilePath)) {
    console.log("Contents of Podfile:", fs.readFileSync(podfilePath, 'utf8'));
  } else {
    console.log("Podfile does not exist at path:", podfilePath);
  }

  const command = `ruby "${newPath}"`;
  console.log("Executing command:", command);

  const child = exec(command);

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);

  child.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  function callback(e) {
    // fs.unlinkSync(newPath);
    console.log("EXIT", e);
    process.exit();
  }

  child.on("exit", callback);
  child.on("close", callback);
  child.on("error", (error) => {
    console.error('Error executing Ruby script:', error);
    callback(error);
  });
}
