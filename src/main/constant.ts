import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/no-cycle
import getEngineConfig from './utils/engine/getEngineConfig';

export const PROGRAM_APP_DATA_PATH = (function () {
  const appDataPath = process.env.APPDATA || '';
  return process.env.NODE_ENV === 'development'
    ? path.join(appDataPath, '../Local/Programs', 'palserver-gui-dev')
    : path.join(appDataPath, '../Local/Programs', 'palserver-gui');
})();

export const APP_DATA_PATH = (function () {
  const appDataPath = process.env.APPDATA || '';
  return process.env.NODE_ENV === 'development'
    ? path.join(appDataPath, '../Local', 'palserver-gui-dev')
    : path.join(appDataPath, '../Local', 'palserver-gui');
})();

const resolveEnginePath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, '../../assets/engine');
  }

  const resourcePath = process.resourcesPath || '';
  const productionCandidates = [
    path.join(resourcePath, 'assets/engine'),
    path.join(__dirname, '../../../assets/engine'),
  ];

  const existingPath = productionCandidates.find((p) => fs.existsSync(p));
  return existingPath || productionCandidates[0];
};

export const ENGINE_PATH = resolveEnginePath();

export const USER_SERVER_INSTANCES_PATH =
  getEngineConfig().USER_SERVER_INSTANCES_PATH ||
  path.join(ENGINE_PATH, 'instances');

export const STEAMCMD_PATH = path.join(ENGINE_PATH, 'steamcmd-engine');

export const STEAMCMDAPPS_TEMPLATE_PATH = path.join(STEAMCMD_PATH, 'steamapps');

export const SERVER_TEMPLATE_PATH = path.join(
  STEAMCMDAPPS_TEMPLATE_PATH,
  'common/PalServer',
);

export const TEMPLATE_PATH = path.join(ENGINE_PATH, 'server-template');

export const SERVER_ICONS_PATH = path.join(ENGINE_PATH, 'server-icons');
