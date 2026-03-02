import { useEffect, useState } from 'react';
import Channels from '../../../../main/ipcs/channels';
import usePolling from '../../usePolling';

const useComputerResources = (
  callback?: (cpuUsage: number, memUsage: number) => void,
) => {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);

  usePolling(() => {
    window.electron.ipcRenderer
      .invoke(Channels.getComputerResources)
      .then((res: { cpuUsage: number; memUsage: number }) => {
        setCpuUsage(res.cpuUsage);
        setMemUsage(Math.round(res.memUsage * 100) / 100);
      });
  }, 2000);

  useEffect(() => {
    if (callback) callback(cpuUsage, memUsage);
  }, [cpuUsage, memUsage]);

  return { cpuUsage, memUsage };
};

export default useComputerResources;
