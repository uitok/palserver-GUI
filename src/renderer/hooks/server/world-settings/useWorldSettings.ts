import { useState } from 'react';
import Channels from '../../../../main/ipcs/channels';
import { WorldSettingsValues } from '../../../../types/WorldSettings.types';
import usePolling from '../../usePolling';

/** 用 redux 搭配 refresh 函示改寫 */

const useWorldSettings = (serverId: string) => {
  const [worldSettings, setWorldSettings] = useState<WorldSettingsValues>({});

  usePolling(
    () => {
      if (serverId) {
        window.electron.ipcRenderer
          .invoke(Channels.getWorldSettings, serverId)
          .then((info) => {
            setWorldSettings(info);
          });
      }
    },
    300,
    !!serverId,
  );

  return {
    worldSettings,
    setWorldSettings: (newWorldSettings: WorldSettingsValues) => {
      window.electron.ipcRenderer.invoke(
        Channels.setWorldSettings,
        serverId,
        newWorldSettings,
      );
    },
  };
};

export default useWorldSettings;
