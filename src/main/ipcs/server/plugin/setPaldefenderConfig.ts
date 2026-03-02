import { ipcMain } from 'electron';
import Channels from '../../channels';
import path from 'path';
import { USER_SERVER_INSTANCES_PATH } from '../../../constant';
import fsc from 'fs';

ipcMain.handle(
  Channels.setPaldefenderConfig,
  async (event, serverId: string, config: any) => {
    const configPath = path.join(
      USER_SERVER_INSTANCES_PATH,
      serverId,
      'server',
      'Pal/Binaries/Win64/PalDefender/Config.json',
    );

    try {
      fsc.writeFileSync(configPath, JSON.stringify(config, null, 2), {
        encoding: 'utf-8',
      });
      return true;
    } catch (e) {
      console.error('[setPaldefenderConfig] Failed to write Config.json:', e);
      return false;
    }
  },
);
