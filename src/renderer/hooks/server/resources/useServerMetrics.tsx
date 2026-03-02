import { useState } from 'react';
import Channels from '../../../../main/ipcs/channels';
import useIsRunningServers from '../../../redux/isRunningServers/useIsRunningServers';
import usePolling from '../../usePolling';

const useServerMetrics = (serverId: string) => {
  const { includeRunningServers } = useIsRunningServers();

  const [serverMetrics, setServerMetrics] = useState<{
    currentplayernum: number;
    serverfps: number;
    serverframetime: number;
    maxplayernum: number;
    uptime: number;
  }>({
    currentplayernum: 0,
    serverfps: 0,
    serverframetime: 0,
    maxplayernum: 0,
    uptime: 0,
  });

  const isRunning = includeRunningServers(serverId);

  usePolling(
    () => {
      window.electron.ipcRenderer
        .invoke(Channels.sendRestAPI, serverId, '/metrics')
        .then((data: typeof serverMetrics) => {
          setServerMetrics(data);
        })
        .catch((error) => {
          console.error('[useServerMetrics]', error);
        });
    },
    3000,
    isRunning,
  );

  return serverMetrics;
};

export default useServerMetrics;
