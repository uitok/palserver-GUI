import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import React, { useCallback, useEffect, useState } from 'react';
import useTranslation from '../../../hooks/translation/useTranslation';
import useServerEngineVersion from '../../../hooks/server/useServerEngineVersion';
import Channels from '../../../../main/ipcs/channels';
import useLatestGameVersion from '../../../hooks/firebase/useLatestGameVersion';
import electronAlert from '../../../utils/electronAlert';
import useServerEngineHasError from '../../../hooks/server/useServerEngineHasError';
import useAllServerInfo from '../../../hooks/server/info/useAllServerInfo';

export default function EngineNeedInstall() {
  const { t } = useTranslation();

  const { versionValue: latestGameVersion } = useLatestGameVersion();
  const [serverEngineVersion, setServerEngineVersion] =
    useServerEngineVersion();

  const engineNeedInstall = serverEngineVersion === 0;
  const engineHasError = useServerEngineHasError();
  const engineNeedUpdate =
    !engineHasError &&
    // @ts-ignore
    latestGameVersion > serverEngineVersion &&
    serverEngineVersion !== 0;

  const serverInfos = useAllServerInfo();

  const [openDialog, setOpenDialog] = useState(false);
  const [serverEngineStartInstall, setServerEngineStartInstall] =
    useState(false);
  const [serverEnginehasInstall, setServerEngineHasInstall] = useState(false);
  const [serverInstallMessage, setServerInstallMessage] = useState('');

  useEffect(() => {
    // Keep dialog open while install/repair is running.
    if (serverEngineStartInstall) {
      setOpenDialog(true);
      return;
    }

    // @ts-ignore
    setOpenDialog(engineNeedInstall || engineNeedUpdate || engineHasError);
  }, [
    engineNeedInstall,
    engineNeedUpdate,
    engineHasError,
    serverEngineStartInstall,
  ]);

  const startInstall = useCallback(
    async ({
      reinstall,
      updateInstances,
    }: {
      reinstall: boolean;
      updateInstances: boolean;
    }) => {
      setServerEngineStartInstall(true);
      setServerInstallMessage('');
      setOpenDialog(true);

      if (reinstall) {
        await window.electron.ipcRenderer.invoke(Channels.clearSystemCache);
      }

      let unsubscribeProgress = () => {};

      window.electron.ipcRenderer.once(Channels.runServerInstallReply.DONE, async () => {
        unsubscribeProgress();

        if (updateInstances) {
          await Promise.all(
            serverInfos.map((serverId) =>
              window.electron.ipcRenderer.invoke(
                Channels.updateServerInstance,
                serverId,
              ),
            ),
          );
        }

        setServerEngineHasInstall(true);
        setServerEngineStartInstall(false);
        setServerEngineVersion(latestGameVersion);
      });

      window.electron.ipcRenderer.once(
        Channels.runServerInstallReply.ERROR,
        (data) => {
          unsubscribeProgress();
          setServerEngineStartInstall(false);
          setOpenDialog(true);

          if (data.errorMessage === 'ASCII') {
            electronAlert(t('HasNotASCIIPath') + window.electron.node.__dirname());
          } else {
            electronAlert(
              `${String(data.errorMessage || 'INSTALL_FAILED')}${
                data.detail ? `\n${String(data.detail)}` : ''
              }`,
            );
          }
        },
      );

      unsubscribeProgress = window.electron.ipcRenderer.on(
        Channels.runServerInstallReply.PROGRESS,
        (data) => {
          if (data.message) {
            setServerInstallMessage(data.message);
          }
        },
      );

      window.electron.ipcRenderer.sendMessage(Channels.runServerInstall);
    },
    [latestGameVersion, serverInfos, setServerEngineVersion, t],
  );

  const runServerInstall = useCallback(() => {
    startInstall({ reinstall: false, updateInstances: false });
  }, [startInstall]);

  const runServerInstallandUpdate = useCallback(() => {
    startInstall({ reinstall: false, updateInstances: true });
  }, [startInstall]);

  const runServerReInstall = useCallback(() => {
    startInstall({ reinstall: true, updateInstances: false });
  }, [startInstall]);

  return (
    <AlertDialog.Root open={openDialog}>
      <AlertDialog.Content maxWidth="650px">
        <AlertDialog.Title>
          {engineHasError &&
            (serverEnginehasInstall ? t('FixCompleted') : t('ServerError'))}
          {engineNeedInstall &&
            (serverEnginehasInstall
              ? t('InstallCompleted')
              : t('FirstTimeWelcome'))}
          {engineNeedUpdate &&
            (serverEnginehasInstall
              ? t('UpdateCompleted')
              : t('ServerNeedsUpdate'))}
        </AlertDialog.Title>
        <AlertDialog.Description size="2">
          <div className="flex gap-8 mt-8 mb-4">
            {engineHasError &&
              (serverEnginehasInstall
                ? t('ServerFileFixCompleted')
                : t('ServerFileMissing'))}
            {engineNeedInstall &&
              (serverEnginehasInstall
                ? t('ServerInstalledCompleted')
                : t('InstallReminder'))}
            {engineNeedUpdate &&
              (serverEnginehasInstall
                ? t('AllServersUpdated')
                : t('UpdateReminder'))}
          </div>
          <div className="flex gap-8 mt-8 mb-4">{serverInstallMessage}</div>
        </AlertDialog.Description>
        <Flex gap="3" mt="4" justify="end">
          {engineHasError &&
            (serverEnginehasInstall ? (
              <AlertDialog.Cancel>
                <Button onClick={() => setOpenDialog(false)}>{t('Close')}</Button>
              </AlertDialog.Cancel>
            ) : (
              <AlertDialog.Action>
                <Button
                  onClick={runServerReInstall}
                  loading={serverEngineStartInstall}
                >
                  {t('Fix')}
                </Button>
              </AlertDialog.Action>
            ))}
          {engineNeedInstall &&
            (serverEnginehasInstall ? (
              <AlertDialog.Cancel>
                <Button onClick={() => setOpenDialog(false)}>{t('Close')}</Button>
              </AlertDialog.Cancel>
            ) : (
              <AlertDialog.Action>
                <Button
                  onClick={runServerInstall}
                  loading={serverEngineStartInstall}
                >
                  {t('Install')}
                </Button>
              </AlertDialog.Action>
            ))}
          {engineNeedUpdate && (
            <AlertDialog.Cancel>
              <Button
                onClick={() => setOpenDialog(false)}
                color="gray"
                variant="soft"
              >
                {t('Cancel')}
              </Button>
            </AlertDialog.Cancel>
          )}
          {engineNeedUpdate && !serverEnginehasInstall && (
            <AlertDialog.Action>
              <Button
                onClick={runServerInstallandUpdate}
                loading={serverEngineStartInstall}
              >
                {t('OneClickUpdate')}
              </Button>
            </AlertDialog.Action>
          )}
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
