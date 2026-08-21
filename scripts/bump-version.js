const fs = require('fs');
const path = require('path');

const newVersion = process.argv[2] || process.env.npm_config_ver;

if (!newVersion) {
  console.error('Error: Please provide a version number (e.g. npm run version:set 1.3.0 or node scripts/bump-version.js 1.3.0)');
  process.exit(1);
}

const rootDir = path.join(__dirname, '..');

// Update JSON files
const jsonFiles = [
  path.join(rootDir, 'package.json'),
  path.join(rootDir, 'backend', 'package.json'),
  path.join(rootDir, 'frontend', 'package.json')
];

jsonFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
    pkg.version = newVersion;
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`Updated ${path.relative(rootDir, file)} -> v${newVersion}`);
  }
});

// Update README.md version badge string
const readmeFile = path.join(rootDir, 'README.md');
if (fs.existsSync(readmeFile)) {
  let readme = fs.readFileSync(readmeFile, 'utf8');
  readme = readme.replace(/> \*\*Version \d+\.\d+\.\d+\*\*/g, `> **Version ${newVersion}**`);
  fs.writeFileSync(readmeFile, readme, 'utf8');
  console.log(`Updated README.md -> v${newVersion}`);
}

// Update frontend/src/version.ts
const versionTsFile = path.join(rootDir, 'frontend', 'src', 'version.ts');
if (fs.existsSync(versionTsFile)) {
  let versionTs = fs.readFileSync(versionTsFile, 'utf8');
  versionTs = versionTs.replace(/export const APP_VERSION = '[^']+';/g, `export const APP_VERSION = '${newVersion}';`);
  fs.writeFileSync(versionTsFile, versionTs, 'utf8');
  console.log(`Updated frontend/src/version.ts -> v${newVersion}`);
}

console.log(`\nSuccessfully bumped project version to ${newVersion}!`);
