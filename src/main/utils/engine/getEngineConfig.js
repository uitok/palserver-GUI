import fs from 'fs';
// eslint-disable-next-line import/no-cycle
import { ENGINE_PATH } from '../../constant';
import path from 'path';

export default function getEngineConfig() {
  const engineConfigPath = path.join(ENGINE_PATH, 'engine.config.json');
  if (!fs.existsSync(engineConfigPath)) {
    return {};
  }

  try {
    const config = fs.readFileSync(engineConfigPath, {
      encoding: 'utf-8',
    });

    if (!config.trim()) {
      return {};
    }

    const parsed = JSON.parse(config);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }

    return parsed;
  } catch (_error) {
    return {};
  }
}
