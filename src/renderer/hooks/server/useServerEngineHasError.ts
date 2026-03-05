import { useEffect, useState } from 'react';
import Channels from '../../../main/ipcs/channels';

const useServerEngineHasError = () => {
  const [serverEngineHasError, setServerEngineHasError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const refresh = () => {
      window.electron.ipcRenderer
        .invoke(Channels.getEngineHasError)
        .then((result) => {
          if (mounted) {
            setServerEngineHasError(result);
          }
        })
        .catch(() => {
          if (mounted) {
            setServerEngineHasError(true);
          }
        });
    };

    refresh();
    const interval = setInterval(refresh, 3000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return serverEngineHasError;
};

export default useServerEngineHasError;
