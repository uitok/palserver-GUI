import fs from 'fs';
// eslint-disable-next-line import/no-cycle
import { ENGINE_PATH } from '../../constant';
import path from 'path';

function readCurrentConfig(engineConfigPath) {
  if (!fs.existsSync(engineConfigPath)) {
    return {};
  }

  try {
    const content = fs.readFileSync(engineConfigPath, {
      encoding: 'utf-8',
    });

    if (!content.trim()) {
      return {};
    }

    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed;
  } catch (_error) {
    return {};
  }
}

export default function setEngineConfig(config) {
  const engineConfigPath = path.join(ENGINE_PATH, 'engine.config.json');
  const currentConfig = readCurrentConfig(engineConfigPath);
  const nextConfig = {
    ...currentConfig,
    ...config,
  };

  fs.mkdirSync(path.dirname(engineConfigPath), { recursive: true });

  fs.writeFileSync(engineConfigPath, JSON.stringify(nextConfig, null, 2), {
    encoding: 'utf-8',
  });
}
