/**
 * 检查当前安装的插件版本
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, '../assets/engine/server-template');
const UE4SS_VERSION_FILE = path.join(TEMPLATE_DIR, 'UE4SS', 'ue4ss.version.txt');
const PALGUARD_VERSION_FILE = path.join(TEMPLATE_DIR, 'Palguard', 'palguard.version.txt');

function readVersion(filePath, pluginName) {
  try {
    if (fs.existsSync(filePath)) {
      const version = fs.readFileSync(filePath, 'utf-8').trim();
      console.log(`✓ ${pluginName}: v${version}`);
      return version;
    } else {
      console.log(`✗ ${pluginName}: 未安装 (缺少版本文件)`);
      return null;
    }
  } catch (error) {
    console.log(`✗ ${pluginName}: 读取失败 - ${error.message}`);
    return null;
  }
}

function checkPluginFiles(dir, pluginName, requiredFiles) {
  console.log(`\n检查 ${pluginName} 文件:`);
  let allExist = true;

  requiredFiles.forEach(file => {
    const filePath = path.join(dir, file);
    const exists = fs.existsSync(filePath);
    console.log(`  ${exists ? '✓' : '✗'} ${file}`);
    if (!exists) allExist = false;
  });

  return allExist;
}

function main() {
  console.log('=== 插件版本检查 ===\n');

  // 检查版本
  const ue4ssVersion = readVersion(UE4SS_VERSION_FILE, 'UE4SS');
  const palguardVersion = readVersion(PALGUARD_VERSION_FILE, 'PalGuard');

  // 检查关键文件
  const ue4ssDir = path.join(TEMPLATE_DIR, 'UE4SS');
  const palguardDir = path.join(TEMPLATE_DIR, 'Palguard');

  const ue4ssFilesOk = checkPluginFiles(ue4ssDir, 'UE4SS', [
    'dwmapi.dll',
    'UE4SS.dll',
    'UE4SS-settings.ini',
  ]);

  const palguardFilesOk = checkPluginFiles(palguardDir, 'PalGuard', [
    'palguard.dll',
    'palguard.json',
  ]);

  // 总结
  console.log('\n=== 总结 ===');
  if (ue4ssVersion && ue4ssFilesOk) {
    console.log(`✓ UE4SS v${ue4ssVersion} 已正确安装`);
  } else {
    console.log('✗ UE4SS 未正确安装，请运行 npm run update-plugins');
  }

  if (palguardVersion && palguardFilesOk) {
    console.log(`✓ PalGuard v${palguardVersion} 已正确安装`);
  } else {
    console.log('✗ PalGuard 未正确安装，请运行 npm run update-plugins');
  }

  if (!ue4ssVersion || !palguardVersion || !ue4ssFilesOk || !palguardFilesOk) {
    console.log('\n提示: 运行 npm run update-plugins 自动下载最新版本');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { readVersion, checkPluginFiles };
