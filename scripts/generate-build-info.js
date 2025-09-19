#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Get current date and time
const now = new Date();
const buildDate = now.toLocaleDateString('en-GB'); // DD/MM/YYYY format
const buildTimestamp = now.toISOString();

// Get version from package.json
const packageJson = require('../package.json');
const appVersion = packageJson.version;

// Generate version name with build date
const versionName = `${appVersion}`;
const versionDisplay = `${appVersion} ${buildDate}`;

// Create build info object
const buildInfo = {
    version: appVersion,
    versionName: versionName,
    versionDisplay: versionDisplay,
    buildDate: buildDate,
    buildTimestamp: buildTimestamp,
};

// Generate JavaScript constants file
const jsContent = `// This file is auto-generated during build time. Do not edit manually.
// Generated on: ${buildTimestamp}

export const BUILD_INFO = ${JSON.stringify(buildInfo, null, 2)};

export const APP_VERSION = '${appVersion}';
export const VERSION_DISPLAY = '${versionDisplay}';
export const BUILD_DATE = '${buildDate}';
export const BUILD_TIMESTAMP = '${buildTimestamp}';
`;

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '../src/generated');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Write the constants file
const outputPath = path.join(outputDir, 'build-info.js');
fs.writeFileSync(outputPath, jsContent);

console.log(`Build info generated: ${outputPath}`);
console.log(`Version: ${versionDisplay}`);
console.log(`Build date: ${buildDate}`);

// Also output for Android build.gradle to use
console.log(`ANDROID_VERSION_NAME=${versionName}`);
console.log(`ANDROID_VERSION_DISPLAY=${versionDisplay}`);
