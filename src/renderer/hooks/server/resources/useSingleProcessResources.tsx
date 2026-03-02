import { useState } from 'react';
import Channels from '../../../../main/ipcs/channels';
import usePolling from '../../usePolling';

const useSingleProcessResources = (processId: number) => {
  const [cpuUsage, setCpuUsage] = useState(0);
  const [memUsage, setMemUsage] = useState(0);

  usePolling(
    () => {
      window.electron.ipcRenderer
        .invoke(Channels.getSingleProcessResources, processId)
        .then((res: { cpuUsage: number; memUsage: number }) => {
          setCpuUsage(Math.round(res.cpuUsage * 100) / 100);
          setMemUsage(Math.round(res.memUsage * 100) / 100);
        });
    },
    2000,
    processId > 0,
  );

  return { cpuUsage, memUsage };
};

export default useSingleProcessResources;
