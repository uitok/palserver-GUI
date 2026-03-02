import { useEffect, useState } from 'react';
import Channels from '../../../../main/ipcs/channels';
import useIsRunningServers from '../../../redux/isRunningServers/useIsRunningServers';
import usePolling from '../../usePolling';

export type OnlinePlayer = {
  name: string;
  playerId: string;
  userId: string;
  ip: string;
  ping: number;
  location_x: number;
  location_y: number;
  level: number;
};

const useServerOnlinePlayers = (serverId: string) => {
  const { includeRunningServers } = useIsRunningServers();
  const isRunning = includeRunningServers(serverId);

  const [players, setPlayers] = useState<OnlinePlayer[]>([]);

  useEffect(() => {
    if (!isRunning) {
      setPlayers([]);
    }
  }, [isRunning]);

  usePolling(
    () => {
      window.electron.ipcRenderer
        .invoke(Channels.sendRestAPI, serverId, '/players')
        .then((data: { players: OnlinePlayer[] }) => {
          setPlayers(data?.players);
        })
        .catch((error) => {
          console.error('[useServerOnlinePlayers]', error);
        });
    },
    5000,
    isRunning,
  );

  return players;
};

export default useServerOnlinePlayers;
