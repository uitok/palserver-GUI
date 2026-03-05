import fs from 'fs';
import path from 'path';
// eslint-disable-next-line import/no-cycle
import getEngineConfig from './utils/engine/getEngineConfig';

const IS_DEV = process.env.NODE_ENV === 'development';

const LEGACY_APP_NAME = IS_DEV ? 'palserver-gui-dev' : 'palserver-gui';
const LEGACY_LOCAL_PATH = (function () {
  const appDataPath = process.env.APPDATA || '';
  return path.resolve(appDataPath, '../Local', LEGACY_APP_NAME);
})();

const LEGACY_PROGRAM_PATH = (function () {
  const appDataPath = process.env.APPDATA || '';
  return path.resolve(appDataPath, '../Local/Programs', LEGACY_APP_NAME);
})();

const normalizePath = (inputPath: string) => {
  return path.resolve(inputPath).replace(/\//g, '\\').toLowerCase();
};

const isDirectoryEmpty = (targetPath: string) => {
  if (!fs.existsSync(targetPath)) {
    return true;
  }

  try {
    return fs.readdirSync(targetPath).length === 0;
  } catch (_error) {
    return true;
  }
};

const ensureDirectory = (targetPath: string) => {
  fs.mkdirSync(targetPath, { recursive: true });
};

const copyDirectoryIfTargetEmpty = (sourcePath: string, targetPath: string) => {
  if (!fs.existsSync(sourcePath) || !isDirectoryEmpty(targetPath)) {
    return false;
  }

  try {
    ensureDirectory(path.dirname(targetPath));
    fs.cpSync(sourcePath, targetPath, { recursive: true });
    return true;
  } catch (_error) {
    return false;
  }
};

export const PROGRAM_APP_DATA_PATH = IS_DEV
  ? LEGACY_PROGRAM_PATH
  : path.dirname(process.execPath);

export const APP_DATA_PATH = IS_DEV
  ? LEGACY_LOCAL_PATH
  : path.join(path.dirname(process.execPath), 'data');

const resolveEnginePath = () => {
  if (IS_DEV) {
    return path.join(__dirname, '../../assets/engine');
  }

  const targetEnginePath = path.join(APP_DATA_PATH, 'engine');
  const resourcePath = process.resourcesPath || '';
  const legacyCandidates = [
    path.join(LEGACY_LOCAL_PATH, 'engine'),
    path.join(resourcePath, 'assets/engine'),
    path.join(__dirname, '../../../assets/engine'),
  ];

  for (const legacyPath of legacyCandidates) {
    if (copyDirectoryIfTargetEmpty(legacyPath, targetEnginePath)) {
      break;
    }
  }

  ensureDirectory(targetEnginePath);
  return targetEnginePath;
};

export const ENGINE_PATH = resolveEnginePath();

const resolveInstancesPath = () => {
  const targetInstancesPath = path.join(APP_DATA_PATH, 'instances');
  const legacyCandidates = [
    path.join(LEGACY_LOCAL_PATH, 'instances'),
    path.join(LEGACY_PROGRAM_PATH, 'instances'),
    path.join(ENGINE_PATH, 'instances'),
    path.join(process.resourcesPath || '', 'assets/engine/instances'),
    path.join(__dirname, '../../../assets/engine/instances'),
  ];

  for (const legacyPath of legacyCandidates) {
    if (copyDirectoryIfTargetEmpty(legacyPath, targetInstancesPath)) {
      break;
    }
  }

  ensureDirectory(targetInstancesPath);
  return targetInstancesPath;
};

const DEFAULT_INSTANCES_PATH = resolveInstancesPath();
const configuredInstancesPath = getEngineConfig().USER_SERVER_INSTANCES_PATH;
const legacyDefaultInstancePaths = [
  path.join(LEGACY_LOCAL_PATH, 'instances'),
  path.join(LEGACY_PROGRAM_PATH, 'instances'),
  path.join(process.resourcesPath || '', 'assets/engine/instances'),
  path.join(__dirname, '../../../assets/engine/instances'),
];

const hasCustomInstancesPath =
  typeof configuredInstancesPath === 'string' &&
  configuredInstancesPath.length > 0 &&
  !legacyDefaultInstancePaths
    .map((candidate) => normalizePath(candidate))
    .includes(normalizePath(configuredInstancesPath));

export const USER_SERVER_INSTANCES_PATH = hasCustomInstancesPath
  ? configuredInstancesPath
  : DEFAULT_INSTANCES_PATH;

export const STEAMCMD_PATH = path.join(ENGINE_PATH, 'steamcmd-engine');

export const STEAMCMDAPPS_TEMPLATE_PATH = path.join(STEAMCMD_PATH, 'steamapps');

export const SERVER_TEMPLATE_PATH = path.join(
  STEAMCMDAPPS_TEMPLATE_PATH,
  'common/PalServer',
);

export const TEMPLATE_PATH = path.join(ENGINE_PATH, 'server-template');

export const SERVER_ICONS_PATH = path.join(ENGINE_PATH, 'server-icons');
