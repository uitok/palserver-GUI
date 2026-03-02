import { ipcMain } from 'electron';
import Channels from '../../channels';
import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../../constant';
import fsc from 'fs';

ipcMain.handle(
  Channels.getPaldefenderConfig,
  async (event, serverId: string) => {
    const configPath = path.join(
      USER_SERVER_INSTANCES_PATH,
      serverId,
      'server',
      'Pal/Binaries/Win64/PalDefender/Config.json',
    );

    if (!fsc.existsSync(configPath)) {
      return null;
    }

    const configText = fsc.readFileSync(configPath, { encoding: 'utf-8' });
    try {
      return JSON.parse(configText);
    } catch (e) {
      console.error('[getPaldefenderConfig] Failed to parse Config.json:', e);
      return null;
    }
  },
);
