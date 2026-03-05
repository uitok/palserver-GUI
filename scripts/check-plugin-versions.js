/**
 * Check installed plugin versions in assets/engine/server-template.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, '../assets/engine/server-template');
const UE4SS_VERSION_FILE = path.join(
  TEMPLATE_DIR,
  'UE4SS',
  'ue4ss.version.txt',
);
const PALGUARD_VERSION_FILE = path.join(
  TEMPLATE_DIR,
  'Palguard',
  'palguard.version.txt',
);

function readVersion(filePath, pluginName) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`✗ ${pluginName}: not installed (missing version file)`);
      return null;
    }

    const version = fs.readFileSync(filePath, 'utf-8').trim();
    console.log(`✓ ${pluginName}: v${version}`);
    return version;
  } catch (error) {
    console.log(`✗ ${pluginName}: failed to read - ${error.message}`);
    return null;
  }
}

function checkAllFiles(dir, pluginName, requiredFiles) {
  console.log(`\nChecking ${pluginName} files:`);
  let ok = true;

  requiredFiles.forEach((file) => {
    const exists = fs.existsSync(path.join(dir, file));
    console.log(`  ${exists ? '✓' : '✗'} ${file}`);
    if (!exists) ok = false;
  });

  return ok;
}

function checkAnyFiles(dir, pluginName, anyGroups) {
  console.log(`\nChecking ${pluginName} files:`);
  let ok = true;

  anyGroups.forEach((group) => {
    const found = group.find((file) => fs.existsSync(path.join(dir, file)));
    console.log(`  ${found ? '✓' : '✗'} ${group.join(' | ')}`);
    if (!found) ok = false;
  });

  return ok;
}

function main() {
  console.log('=== Plugin Version Check ===\n');

  const ue4ssVersion = readVersion(UE4SS_VERSION_FILE, 'UE4SS');
  const palguardVersion = readVersion(PALGUARD_VERSION_FILE, 'PalGuard');

  const ue4ssDir = path.join(TEMPLATE_DIR, 'UE4SS');
  const palguardDir = path.join(TEMPLATE_DIR, 'Palguard');

  const ue4ssFilesOk = checkAllFiles(ue4ssDir, 'UE4SS', [
    'dwmapi.dll',
    'UE4SS.dll',
    'UE4SS-settings.ini',
  ]);

  const palguardFilesOk = checkAnyFiles(palguardDir, 'PalGuard', [
    ['PalDefender.dll', 'palguard.dll'],
    ['d3d9.dll'],
  ]);

  console.log('\n=== Summary ===');
  if (ue4ssVersion && ue4ssFilesOk) {
    console.log(`✓ UE4SS v${ue4ssVersion} is installed correctly`);
  } else {
    console.log('✗ UE4SS is not installed correctly, run: npm run update-plugins');
  }

  if (palguardVersion && palguardFilesOk) {
    console.log(`✓ PalGuard v${palguardVersion} is installed correctly`);
  } else {
    console.log('✗ PalGuard is not installed correctly, run: npm run update-plugins');
  }

  if (!ue4ssVersion || !palguardVersion || !ue4ssFilesOk || !palguardFilesOk) {
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { readVersion, checkAllFiles, checkAnyFiles };
