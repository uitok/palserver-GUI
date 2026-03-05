import { ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { SERVER_TEMPLATE_PATH } from '../../../constant';
import Channels from '../../channels';

ipcMain.handle(Channels.getEngineHasError, async () => {
  const serverExecutablePath = path.join(
    SERVER_TEMPLATE_PATH,
    'Pal/Binaries/Win64/PalServer-Win64-Shipping-Cmd.exe',
  );

  try {
    await fs.access(SERVER_TEMPLATE_PATH);
    await fs.access(serverExecutablePath);
    return false;
  } catch (_error) {
    return true;
  }
});
