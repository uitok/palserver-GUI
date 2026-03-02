import { ipcMain } from 'electron';
import Channels from '../../channels';
import getWorldSettingsByServerId from '../../../services/worldSettings/getWorldSettingsByServerId';
import trimWorldSettingsString from '../../../../utils/trimWorldSettingsString';
import sendCommand from '../../../utils/rcon/sendCommand';
import axios from 'axios';

ipcMain.on(Channels.execShutdownServer, async (event, serverId, processId) => {
  const worldSettings = await getWorldSettingsByServerId(serverId);
  const serverOptions = {
    ipAddress: '127.0.0.1',
    port: worldSettings.RCONPort,
    password: trimWorldSettingsString(worldSettings.AdminPassword),
  };
  const isEnabledRCON = worldSettings.RCONEnabled;
  const isEnabledREST = worldSettings.RESTAPIEnabled;

  try {
    // 存檔
    await sendCommand(serverOptions, 'save');
    if (isEnabledRCON) {
      // 執行 rcon 關閉伺服器
      await sendCommand(serverOptions, 'shutdown 1');
    } else if (isEnabledREST) {
      // 使用 REST API 關閉伺服器
      const password = trimWorldSettingsString(worldSettings.AdminPassword);
      await axios.post(
        `http://127.0.0.1:${worldSettings.RESTAPIPort}/v1/api/stop`,
        {},
        { auth: { username: 'admin', password } },
      );
    } else {
      process.kill(processId);
    }
  } catch (e) {
    // RCON/REST 失敗時，嘗試 REST API 作為後備
    if (isEnabledREST) {
      try {
        const password = trimWorldSettingsString(worldSettings.AdminPassword);
        await axios.post(
          `http://127.0.0.1:${worldSettings.RESTAPIPort}/v1/api/stop`,
          {},
          { auth: { username: 'admin', password } },
        );
        return;
      } catch (restError) {
        console.error('[execShutdownServer] REST API fallback failed:', restError);
      }
    }
    process.kill(processId);
  }
});
