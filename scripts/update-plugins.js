/**
 * 自动更新 PalDefender 和 UE4SS 到最新版本
 *
 * 使用方法：
 * node scripts/update-plugins.js
 *
 * 或在 package.json 中添加：
 * "update-plugins": "node scripts/update-plugins.js"
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// GitHub API 配置
const GITHUB_API = 'https://api.github.com';
const UE4SS_REPO = 'UE4SS-RE/RE-UE4SS';
const PALGUARD_REPO = 'Dalufishe/PalGuard'; // 需要确认实际仓库名

// 目标目录
const TEMPLATE_DIR = path.join(__dirname, '../assets/engine/server-template');
const UE4SS_DIR = path.join(TEMPLATE_DIR, 'UE4SS');
const PALGUARD_DIR = path.join(TEMPLATE_DIR, 'Palguard');

/**
 * 获取 GitHub 仓库的最新 release
 */
function getLatestRelease(repo) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repo}/releases/latest`,
      headers: {
        'User-Agent': 'palserver-GUI-updater',
      },
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * 下载文件
 */
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // 处理重定向
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

/**
 * 解压 zip 文件
 */
function extractZip(zipPath, targetDir) {
  try {
    // 使用 PowerShell 解压（Windows）
    execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`, {
      stdio: 'inherit',
    });
    console.log(`✓ 解压完成: ${targetDir}`);
  } catch (error) {
    console.error(`✗ 解压失败: ${error.message}`);
    throw error;
  }
}

/**
 * 更新 UE4SS
 */
async function updateUE4SS() {
  console.log('\n=== 更新 UE4SS ===');

  try {
    const release = await getLatestRelease(UE4SS_REPO);
    const version = release.tag_name;
    console.log(`最新版本: ${version}`);

    // 查找 Windows 版本的 zip 文件
    const asset = release.assets.find(a =>
      a.name.includes('UE4SS') &&
      a.name.includes('.zip') &&
      !a.name.includes('zDEV')
    );

    if (!asset) {
      throw new Error('未找到适用的 UE4SS 下载文件');
    }

    console.log(`下载: ${asset.name}`);
    const zipPath = path.join(__dirname, asset.name);
    await downloadFile(asset.browser_download_url, zipPath);

    // 确保目标目录存在
    if (!fs.existsSync(UE4SS_DIR)) {
      fs.mkdirSync(UE4SS_DIR, { recursive: true });
    }

    // 解压
    extractZip(zipPath, UE4SS_DIR);

    // 写入版本文件
    fs.writeFileSync(
      path.join(UE4SS_DIR, 'ue4ss.version.txt'),
      version.replace('v', '')
    );

    // 清理下载的 zip
    fs.unlinkSync(zipPath);

    console.log(`✓ UE4SS 更新完成: ${version}`);
    return version;
  } catch (error) {
    console.error(`✗ UE4SS 更新失败: ${error.message}`);
    throw error;
  }
}

/**
 * 更新 PalGuard/PalDefender
 */
async function updatePalGuard() {
  console.log('\n=== 更新 PalGuard ===');

  try {
    const release = await getLatestRelease(PALGUARD_REPO);
    const version = release.tag_name;
    console.log(`最新版本: ${version}`);

    // 查找下载文件
    const asset = release.assets.find(a =>
      a.name.includes('PalGuard') &&
      a.name.includes('.zip')
    );

    if (!asset) {
      throw new Error('未找到适用的 PalGuard 下载文件');
    }

    console.log(`下载: ${asset.name}`);
    const zipPath = path.join(__dirname, asset.name);
    await downloadFile(asset.browser_download_url, zipPath);

    // 确保目标目录存在
    if (!fs.existsSync(PALGUARD_DIR)) {
      fs.mkdirSync(PALGUARD_DIR, { recursive: true });
    }

    // 解压
    extractZip(zipPath, PALGUARD_DIR);

    // 写入版本文件
    fs.writeFileSync(
      path.join(PALGUARD_DIR, 'palguard.version.txt'),
      version.replace('v', '')
    );

    // 清理下载的 zip
    fs.unlinkSync(zipPath);

    console.log(`✓ PalGuard 更新完成: ${version}`);
    return version;
  } catch (error) {
    console.error(`✗ PalGuard 更新失败: ${error.message}`);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('开始更新插件到最新版本...\n');

  const results = {
    ue4ss: null,
    palguard: null,
  };

  try {
    results.ue4ss = await updateUE4SS();
  } catch (error) {
    console.error('UE4SS 更新失败，继续更新其他插件...');
  }

  try {
    results.palguard = await updatePalGuard();
  } catch (error) {
    console.error('PalGuard 更新失败');
  }

  console.log('\n=== 更新摘要 ===');
  console.log(`UE4SS: ${results.ue4ss || '失败'}`);
  console.log(`PalGuard: ${results.palguard || '失败'}`);

  if (!results.ue4ss && !results.palguard) {
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main().catch((error) => {
    console.error('更新失败:', error);
    process.exit(1);
  });
}

module.exports = { updateUE4SS, updatePalGuard };
