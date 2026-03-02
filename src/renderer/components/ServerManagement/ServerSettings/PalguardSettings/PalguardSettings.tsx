import {
  AlertDialog,
  Button,
  Flex,
  ScrollArea,
  Switch,
  Text,
  TextField,
  Theme,
} from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import useTranslation from '../../../../hooks/translation/useTranslation';
import Channels from '../../../../../main/ipcs/channels';
import useSelectedServerInstance from '../../../../redux/selectedServerInstance/useSelectedServerInstance';

type ConfigField = {
  key: string;
  type: 'bool' | 'number' | 'string' | 'array_string';
};

const configFields: ConfigField[] = [
  // Anti-cheat
  { key: 'shouldWarnCheaters', type: 'bool' },
  { key: 'shouldWarnCheatersReason', type: 'bool' },
  { key: 'shouldKickCheaters', type: 'bool' },
  { key: 'shouldBanCheaters', type: 'bool' },
  { key: 'shouldIPBanCheaters', type: 'bool' },
  { key: 'preventAdminPasswordInChat', type: 'bool' },
  { key: 'exitServerOnStartupFailure', type: 'bool' },
  // RCON
  { key: 'RCONTimeout', type: 'number' },
  { key: 'RCONUsePacketIdFix', type: 'bool' },
  { key: 'RCONbase64', type: 'bool' },
  // Logging
  { key: 'logNetworking', type: 'bool' },
  { key: 'logNetworkingToConsole', type: 'bool' },
  { key: 'logChat', type: 'bool' },
  { key: 'logRCON', type: 'bool' },
  { key: 'logPlayerUID', type: 'bool' },
  { key: 'logPlayerIP', type: 'bool' },
  { key: 'logPlayerDeaths', type: 'bool' },
  { key: 'logPlayerLogins', type: 'bool' },
  { key: 'logPlayerBuildings', type: 'bool' },
  { key: 'logHelicopterKills', type: 'bool' },
  { key: 'logPlayerSummons', type: 'bool' },
  { key: 'logPlayerCaptures', type: 'bool' },
  { key: 'logCraftings', type: 'bool' },
  { key: 'logTechUnlocks', type: 'bool' },
  { key: 'logOpenOilrigBoxes', type: 'bool' },
  // Admin
  { key: 'useAdminWhitelist', type: 'bool' },
  { key: 'adminAutoLogin', type: 'bool' },
  { key: 'allowAdminCheats', type: 'bool' },
  { key: 'allowGodmodeOnehit', type: 'bool' },
  // Whitelist / Protection
  { key: 'useWhitelist', type: 'bool' },
  { key: 'whitelistMessage', type: 'string' },
  { key: 'steamidProtection', type: 'bool' },
  { key: 'blockTowerBossCapture', type: 'bool' },
  { key: 'disableIllegalItemProtection', type: 'bool' },
  { key: 'disableButchering', type: 'bool' },
  { key: 'disableRenaming', type: 'bool' },
  { key: 'disablePalRenaming', type: 'bool' },
  { key: 'doActionUponIllegalPalStats', type: 'bool' },
  { key: 'palStatsMaxRank', type: 'number' },
  // PvP / Limits
  { key: 'pvpMaxToBuildingDamage', type: 'number' },
  { key: 'pvpMaxToPalDamage', type: 'number' },
  { key: 'pveMaxToPalBanThreshold', type: 'number' },
  { key: 'treeLimiter', type: 'number' },
  { key: 'OilrigGoalBoxLocktime', type: 'number' },
  // Announcements
  { key: 'announceConnections', type: 'bool' },
  { key: 'dontAnnounceAdminConnections', type: 'bool' },
  { key: 'announcePunishments', type: 'bool' },
  { key: 'announcePlayerDeaths', type: 'bool' },
  { key: 'announceOpenOilrigBoxes', type: 'bool' },
  { key: 'announceHelicopterKills', type: 'bool' },
  { key: 'announcePlayerSummons', type: 'bool' },
  { key: 'announceAdminSummons', type: 'bool' },
  { key: 'announceAdminSummonsKill', type: 'bool' },
  // Chat
  { key: 'chatBypassWait', type: 'bool' },
  { key: 'chatMessageMaxLen', type: 'number' },
  { key: 'isChineseCmd', type: 'bool' },
  // Messages
  { key: 'bannedMessage', type: 'string' },
  // Arrays (comma-separated)
  { key: 'adminIPs', type: 'array_string' },
  { key: 'bannedIPs', type: 'array_string' },
  { key: 'bannedChatWords', type: 'array_string' },
  { key: 'bannedNames', type: 'array_string' },
  { key: 'bannedTechnologies', type: 'array_string' },
  { key: 'adminCheats', type: 'array_string' },
  // MOTD (array of strings)
  { key: 'MOTD', type: 'array_string' },
];

export default function PalguardSettings() {
  const { t } = useTranslation();
  const { selectedServerInstance } = useSelectedServerInstance();

  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.electron.ipcRenderer
      .invoke(Channels.getPaldefenderConfig, selectedServerInstance)
      .then((data: any) => {
        setConfig(data || {});
        setLoading(false);
      })
      .catch(() => {
        setConfig({});
        setLoading(false);
      });
  }, [selectedServerInstance]);

  const handleSave = async () => {
    setSaving(true);
    await window.electron.ipcRenderer.invoke(
      Channels.setPaldefenderConfig,
      selectedServerInstance,
      config,
    );
    setSaving(false);
    window.electron.ipcRenderer.sendMessage('alert', t('SaveSuccess'));
  };

  const updateField = (key: string, value: any) => {
    setConfig({ ...config, [key]: value });
  };

  if (loading || !config) {
    return (
      <AlertDialog.Content style={{ maxWidth: 700 }}>
        <AlertDialog.Title>{t('PalguardSettings')}</AlertDialog.Title>
        <AlertDialog.Description>
          <Text size="2" color="gray">
            Loading...
          </Text>
        </AlertDialog.Description>
      </AlertDialog.Content>
    );
  }

  return (
    <AlertDialog.Content style={{ maxWidth: 700 }}>
      <AlertDialog.Title>{t('PalguardSettings')}</AlertDialog.Title>
      <AlertDialog.Description>
        <ScrollArea scrollbars="vertical" style={{ height: '60vh' }}>
          <div className="flex flex-col gap-3 pr-4">
            {configFields.map((field) => {
              const value = config[field.key];
              if (value === undefined && field.type !== 'array_string')
                return null;

              return (
                <Theme
                  key={field.key}
                  appearance="dark"
                  style={{ background: 'inherit' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <Text size="2" weight="medium" style={{ minWidth: 200 }}>
                      {field.key}
                    </Text>
                    {field.type === 'bool' && (
                      <Switch
                        checked={!!value}
                        onCheckedChange={(v) => updateField(field.key, v)}
                      />
                    )}
                    {field.type === 'number' && (
                      <TextField.Root
                        type="number"
                        size="1"
                        value={value ?? ''}
                        onChange={(e) =>
                          updateField(field.key, Number(e.target.value))
                        }
                        style={{ width: 100 }}
                      />
                    )}
                    {field.type === 'string' && (
                      <TextField.Root
                        size="1"
                        value={value ?? ''}
                        onChange={(e) =>
                          updateField(field.key, e.target.value)
                        }
                        style={{ width: 250 }}
                      />
                    )}
                    {field.type === 'array_string' && (
                      <TextField.Root
                        size="1"
                        value={
                          Array.isArray(value) ? value.join(', ') : value ?? ''
                        }
                        onChange={(e) => {
                          const arr = e.target.value
                            .split(',')
                            .map((s: string) => s.trim())
                            .filter(Boolean);
                          updateField(field.key, arr);
                        }}
                        placeholder="item1, item2, ..."
                        style={{ width: 250 }}
                      />
                    )}
                  </div>
                </Theme>
              );
            })}
          </div>
        </ScrollArea>
      </AlertDialog.Description>
      <Flex gap="3" mt="4" justify="between">
        <Button
          color="yellow"
          size="2"
          onClick={() => {
            window.electron.openExplorer(
              window.electron.node
                .path()
                .join(
                  window.electron.constant.USER_SERVER_INSTANCES_PATH(),
                  selectedServerInstance,
                  'server/Pal/Binaries/Win64/PalDefender/Config.json',
                ),
            );
          }}
        >
          {t('EditFromSourceFile')}
        </Button>
        <div className="flex gap-2">
          <AlertDialog.Cancel>
            <Button variant="soft" color="gray">
              {t('Cancel')}
            </Button>
          </AlertDialog.Cancel>
          <Button onClick={handleSave} disabled={saving}>
            {t('Save')}
          </Button>
        </div>
      </Flex>
    </AlertDialog.Content>
  );
}
