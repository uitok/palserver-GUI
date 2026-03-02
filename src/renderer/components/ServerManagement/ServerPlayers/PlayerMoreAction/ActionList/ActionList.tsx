/* eslint-disable react/jsx-curly-brace-presence */
import { AlertDialog, Button, Flex } from '@radix-ui/themes';
import Channels from '../../../../../../main/ipcs/channels';
import useTranslation from '../../../../../hooks/translation/useTranslation';
import useSelectedServerInstance from '../../../../../redux/selectedServerInstance/useSelectedServerInstance';
import ActionItem from '../AcionItem/AcionItem';
import formatLocale from '../../../../../utils/formatLocale';
import sanitizeRconInput from '../../../../../../utils/sanitizeRconInput';
import { ActionType } from '../PlayerMoreAction';

export default function ActionList({
  actionType,
  setActionType,
  playerId,
  steamid,
  name,
}: {
  actionType: ActionType;
  setActionType: (type: ActionType) => void;
  playerId: string;
  steamid: string;
  name: string;
}) {
  const { t } = useTranslation();

  const pgSteamId = 'steam_' + steamid.slice(6);

  const { selectedServerInstance } = useSelectedServerInstance();
  // const isUsingPalguard = useIsUsingPalguard(selectedGameSave);

  const handleSetAdmin = () => {
    window.electron.ipcRenderer.invoke(
      Channels.sendRCONCommand,
      selectedServerInstance,
      `setadmin ${pgSteamId}`,
    );
  };

  const handleKickUser = () => {
    window.electron.ipcRenderer
      .invoke(Channels.sendRestAPI, selectedServerInstance, '/kick', {
        method: 'post',
        body: { userid: steamid },
      })
      .catch(() => {
        // Fallback to RCON
        window.electron.ipcRenderer.invoke(
          Channels.sendRCONCommand,
          selectedServerInstance,
          `KickPlayer ${steamid}`,
        );
      });
  };

  const handleBanUser = () => {
    window.electron.ipcRenderer
      .invoke(Channels.sendRestAPI, selectedServerInstance, '/ban', {
        method: 'post',
        body: { userid: steamid },
      })
      .catch(() => {
        // Fallback to RCON
        window.electron.ipcRenderer.invoke(
          Channels.sendRCONCommand,
          selectedServerInstance,
          `BanPlayer ${playerId}`,
        );
      });
  };

  const handleUnbanUser = () => {
    window.electron.ipcRenderer.invoke(
      Channels.sendRestAPI,
      selectedServerInstance,
      '/unban',
      { method: 'post', body: { userid: steamid } },
    );
  };

  const handleBanUserIP = () => {
    window.electron.ipcRenderer.invoke(
      Channels.sendRCONCommand,
      selectedServerInstance,
      `ipbanid ${pgSteamId}`,
    );
  };

  return (
    <AlertDialog.Content>
      <AlertDialog.Title>{t('AdvancedActions')}</AlertDialog.Title>
      <AlertDialog.Description>
        {/* <p className="my-2">進階操作使用第三方插件 PalGuard 實現</p> */}
        <div className="flex flex-col gap-4 pt-2">
          <ActionItem
            title={t('SetAsAdmin')}
            subtitle={formatLocale(t('SetAsAdminDesc'), [name])}
            buttonText={t('Set')}
            onButtonClick={handleSetAdmin}
          />
          <ActionItem
            title={formatLocale(t('KickPlayerTitle'), [name])}
            subtitle={formatLocale(t('KickPlayerDesc'), [name, name])}
            buttonText={t('KickPlayer')}
            color="red"
            onButtonClick={handleKickUser}
          />
          <ActionItem
            title={formatLocale(t('BanPlayerTitle'), [name])}
            subtitle={formatLocale(t('BanDesc'), [name, name])}
            buttonText={t('Ban')}
            color="red"
            onButtonClick={handleBanUser}
          />
          <ActionItem
            title={formatLocale(t('BanIP'), [name])}
            subtitle={formatLocale(t('BanDesc'), [name, name])}
            buttonText={t('Ban')}
            color="red"
            onButtonClick={handleBanUserIP}
          />
          <ActionItem
            title={formatLocale(t('UnbanPlayerTitle'), [name])}
            subtitle={formatLocale(t('UnbanDesc'), [name])}
            buttonText={t('Unban')}
            onButtonClick={handleUnbanUser}
          />
          <ActionItem
            title={t('GiveItem')}
            subtitle={formatLocale(t('GiveItemDesc'), [name])}
            buttonText={t('Choose')}
            color="yellow"
            onButtonClick={() => {
              setActionType('give_items');
            }}
          />
          <ActionItem
            title={t('GivePal')}
            subtitle={formatLocale(t('GivePalDesc'), [name])}
            buttonText={t('Choose')}
            color="yellow"
            onButtonClick={() => {
              setActionType('give_pals');
            }}
          />
          <ActionItem
            title={t('GiveExp')}
            subtitle={formatLocale(t('GiveExpDesc'), [name])}
            buttonText={t('Give')}
            color="yellow"
            hasInput
            inputDefaultValue={100000}
            onButtonClick={(value: number) => {
              window.electron.ipcRenderer.invoke(
                Channels.sendRCONCommand,
                selectedServerInstance,
                `give_exp steam_${steamid.slice(6)} ${value}`,
              );
            }}
          />
          <ActionItem
            title={t('GiveRelic')}
            subtitle={formatLocale(t('GiveRelicDesc'), [name])}
            buttonText={t('Give')}
            color="yellow"
            hasInput
            inputDefaultValue={1}
            onButtonClick={(value: number) => {
              window.electron.ipcRenderer.invoke(
                Channels.sendRCONCommand,
                selectedServerInstance,
                `give_relic ${pgSteamId} ${value}`,
              );
            }}
          />
          <ActionItem
            title={t('GiveTech')}
            subtitle={formatLocale(t('GiveTechDesc'), [name])}
            buttonText={t('Give')}
            color="yellow"
            hasInput
            inputDefaultValue={1}
            onButtonClick={(value: number) => {
              window.electron.ipcRenderer.invoke(
                Channels.sendRCONCommand,
                selectedServerInstance,
                `givetech ${pgSteamId} ${value}`,
              );
            }}
          />
          <ActionItem
            title={t('GiveBossTech')}
            subtitle={formatLocale(t('GiveBossTechDesc'), [name])}
            buttonText={t('Give')}
            color="yellow"
            hasInput
            inputDefaultValue={1}
            onButtonClick={(value: number) => {
              window.electron.ipcRenderer.invoke(
                Channels.sendRCONCommand,
                selectedServerInstance,
                `givebosstech ${pgSteamId} ${value}`,
              );
            }}
          />
          <ActionItem
            title={t('WhitelistAdd')}
            subtitle={formatLocale(t('WhitelistAddDesc'), [name])}
            buttonText={t('Add')}
            onButtonClick={() => {
              window.electron.ipcRenderer.invoke(
                Channels.sendRCONCommand,
                selectedServerInstance,
                `whitelist_add ${pgSteamId}`,
              );
            }}
          />
          <ActionItem
            title={t('RenamePlayer')}
            subtitle={formatLocale(t('RenamePlayerDesc'), [name])}
            buttonText={t('Set')}
            color="yellow"
            hasInput
            inputDefaultValue={''}
            onButtonClick={(value: string) => {
              window.electron.ipcRenderer.invoke(
                Channels.sendRCONCommand,
                selectedServerInstance,
                `renameplayer ${pgSteamId} ${sanitizeRconInput(String(value))}`,
              );
            }}
          />
          <ActionItem
            title={t('GodMode')}
            subtitle={formatLocale(t('GodModeDesc'), [name])}
            buttonText={t('Toggle')}
            color="yellow"
            onButtonClick={() => {
              window.electron.ipcRenderer.invoke(
                Channels.sendRCONCommand,
                selectedServerInstance,
                `godmode ${pgSteamId}`,
              );
            }}
          />
          <ActionItem
            title={t('LearnTech')}
            subtitle={formatLocale(t('LearnTechDesc'), [name])}
            buttonText={t('Give')}
            color="yellow"
            hasInput
            inputDefaultValue={''}
            onButtonClick={(value: string) => {
              window.electron.ipcRenderer.invoke(
                Channels.sendRCONCommand,
                selectedServerInstance,
                `learntech ${pgSteamId} ${sanitizeRconInput(String(value))}`,
              );
            }}
          />
          <ActionItem
            title={t('SpawnPal')}
            subtitle={formatLocale(t('SpawnPalDesc'), [name])}
            buttonText={t('Choose')}
            color="yellow"
            onButtonClick={() => {
              setActionType('spawn_pal');
            }}
          />
          <ActionItem
            title={t('GiveEgg')}
            subtitle={formatLocale(t('GiveEggDesc'), [name])}
            buttonText={t('Choose')}
            color="yellow"
            onButtonClick={() => {
              setActionType('give_egg');
            }}
          />
          <ActionItem
            title={t('ClearInventory')}
            subtitle={formatLocale(t('ClearInventoryDesc'), [name])}
            buttonText={t('Clear')}
            color="red"
            onButtonClick={() => {
              if (window.confirm(t('ClearInventoryConfirm'))) {
                window.electron.ipcRenderer.invoke(
                  Channels.sendRCONCommand,
                  selectedServerInstance,
                  `clearinv ${pgSteamId}`,
                );
              }
            }}
          />
          <ActionItem
            title={t('DeletePals')}
            subtitle={formatLocale(t('DeletePalsDesc'), [name])}
            buttonText={t('Delete')}
            color="red"
            onButtonClick={() => {
              if (window.confirm(t('DeletePalsConfirm'))) {
                window.electron.ipcRenderer.invoke(
                  Channels.sendRCONCommand,
                  selectedServerInstance,
                  `deletepals ${pgSteamId} all`,
                );
              }
            }}
          />
        </div>
      </AlertDialog.Description>
      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray">
            {t('Cancel')}
          </Button>
        </AlertDialog.Cancel>
      </Flex>
    </AlertDialog.Content>
  );
}
