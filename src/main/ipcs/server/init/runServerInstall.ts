/* eslint-disable no-use-before-define */
import { spawn } from 'child_process';
import { ipcMain } from 'electron';
import Channels from '../../channels';
import path from 'path';
import fs from 'fs';
import {
  ENGINE_PATH,
  SERVER_TEMPLATE_PATH,
  STEAMCMD_PATH,
} from '../../../constant';
import isASCII from '../../../../utils/isASCII';
import loadSavedTemplate from '../../../services/templates/loadSaveTemplate';
import loadUE4SSTemplate from '../../../services/templates/loadUE4SSTemplate';
import loadPalguardTemplate from '../../../services/templates/loadPalguardTemplate';

ipcMain.on(Channels.runServerInstall, async (event) => {
  if (!isASCII(ENGINE_PATH)) {
    event.reply(Channels.runServerInstallReply.ERROR, {
      errorMessage: 'ASCII',
    });
    return;
  }

  const steamcmd = path.join(STEAMCMD_PATH, 'steamcmd.exe');
  const serverExecutablePath = path.join(
    SERVER_TEMPLATE_PATH,
    'Pal/Binaries/Win64/PalServer-Win64-Shipping-Cmd.exe',
  );

  if (!fs.existsSync(steamcmd)) {
    event.reply(Channels.runServerInstallReply.ERROR, {
      errorMessage: 'STEAMCMD_NOT_FOUND',
      detail: steamcmd,
    });
    return;
  }

  fs.mkdirSync(SERVER_TEMPLATE_PATH, { recursive: true });

  const palserverUpdate = spawn(
    steamcmd,
    [
      '+force_install_dir',
      SERVER_TEMPLATE_PATH,
      '+login',
      'anonymous',
      '+app_update',
      // palworld dedicated server id
      '2394010',
      'validate',
      '+quit',
    ],
    {
      cwd: STEAMCMD_PATH,
      windowsHide: true,
    },
  );

  let hasFinished = false;
  const replyInstallError = (errorMessage: string, detail?: string) => {
    if (hasFinished) return;
    hasFinished = true;
    event.reply(Channels.runServerInstallReply.ERROR, {
      errorMessage,
      detail,
    });
  };

  palserverUpdate.stdout.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      event.reply(Channels.runServerInstallReply.PROGRESS, {
        message: message.slice(0, 200),
      });
    }
  });

  palserverUpdate.stderr.on('data', (data) => {
    const message = data.toString().trim();
    if (message) {
      event.reply(Channels.runServerInstallReply.PROGRESS, {
        message: `[stderr] ${message.slice(0, 200)}`,
      });
    }
  });

  palserverUpdate.on('error', (error) => {
    replyInstallError('INSTALL_FAILED', error.message);
  });

  palserverUpdate.on('exit', async (code) => {
    if (hasFinished) return;

    if (code !== 0) {
      replyInstallError('INSTALL_EXIT_NON_ZERO', `exit code: ${code}`);
      return;
    }

    if (!fs.existsSync(serverExecutablePath)) {
      replyInstallError('INSTALL_OUTPUT_NOT_FOUND', serverExecutablePath);
      return;
    }

    try {
      await Promise.all([
        loadSavedTemplate(path.join(SERVER_TEMPLATE_PATH, 'Pal/Saved')),
        loadUE4SSTemplate(
          path.join(SERVER_TEMPLATE_PATH, 'Pal/Binaries/Win64'),
        ),
        loadPalguardTemplate(
          path.join(SERVER_TEMPLATE_PATH, 'Pal/Binaries/Win64'),
        ),
      ]);
      hasFinished = true;
      event.reply(Channels.runServerInstallReply.DONE);
    } catch (error: any) {
      replyInstallError('TEMPLATE_SYNC_FAILED', error?.message);
    }
  });
});
