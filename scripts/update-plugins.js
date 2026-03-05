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

// 版本配置文件
const VERSION_CONFIG_PATH = path.join(__dirname, '../plugin-versions.json');

// 目标目录
const TEMPLATE_DIR = path.join(__dirname, '../assets/engine/server-template');
const UE4SS_DIR = path.join(TEMPLATE_DIR, 'UE4SS');
const PALGUARD_DIR = path.join(TEMPLATE_DIR, 'Palguard');

/**
 * 读取版本配置
 */
function readVersionConfig() {
  try {
    return JSON.parse(fs.readFileSync(VERSION_CONFIG_PATH, 'utf-8'));
  } catch {
    return {
      ue4ss: { repo: 'UE4SS-RE/RE-UE4SS', version: '' },
      palguard: { repo: 'Ultimeit/PalDefender', version: '' },
    };
  }
}

/**
 * 保存版本配置
 */
function saveVersionConfig(config) {
  fs.writeFileSync(VERSION_CONFIG_PATH, JSON.stringify(config, null, 2) + '\n');
}

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

    // 使用 GitHub token (CI 环境)
    if (process.env.GH_TOKEN) {
      options.headers['Authorization'] = `Bearer ${process.env.GH_TOKEN}`;
    }

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
        file.close();
        fs.unlinkSync(dest);
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
 * 解压 zip 文件（跨平台）
 */
function extractZip(zipPath, targetDir) {
  try {
    if (process.platform === 'win32') {
      execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath '${targetDir}' -Force"`, {
        stdio: 'inherit',
      });
    } else {
      execSync(`unzip -o "${zipPath}" -d "${targetDir}"`, {
        stdio: 'inherit',
      });
    }
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

  const config = readVersionConfig();
  const repo = config.ue4ss.repo || 'UE4SS-RE/RE-UE4SS';

  try {
    const release = await getLatestRelease(repo);
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
    const versionStr = version.replace('v', '');
    fs.writeFileSync(
      path.join(UE4SS_DIR, 'ue4ss.version.txt'),
      versionStr
    );

    // 更新版本配置
    config.ue4ss.version = versionStr;
    saveVersionConfig(config);

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

  const config = readVersionConfig();
  const repo = config.palguard.repo || 'Ultimeit/PalDefender';

  try {
    const release = await getLatestRelease(repo);
    const version = release.tag_name;
    console.log(`最新版本: ${version}`);

    // 查找下载文件
    const asset = release.assets.find(
      (a) =>
        (a.name.includes('PalGuard') || a.name.includes('PalDefender')) &&
        a.name.includes('.zip'),
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
    const versionStr = version.replace('v', '');
    fs.writeFileSync(
      path.join(PALGUARD_DIR, 'palguard.version.txt'),
      versionStr
    );

    // 更新版本配置
    config.palguard.version = versionStr;
    saveVersionConfig(config);

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
