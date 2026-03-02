import {
  AlertDialog,
  Button,
  Flex,
  ScrollArea,
  Text,
  TextField,
  Theme,
} from '@radix-ui/themes';
import { useEffect, useState } from 'react';
import { MdDelete, MdRefresh } from 'react-icons/md';
import useTranslation from '../../../../hooks/translation/useTranslation';
import Channels from '../../../../../main/ipcs/channels';
import useSelectedServerInstance from '../../../../redux/selectedServerInstance/useSelectedServerInstance';

export default function WhitelistSettings() {
  const { t } = useTranslation();
  const { selectedServerInstance } = useSelectedServerInstance();

  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newSteamId, setNewSteamId] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const response = await window.electron.ipcRenderer.invoke(
        Channels.sendRCONCommand,
        selectedServerInstance,
        'whitelist_get',
      );
      if (response) {
        const lines = response
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0 && line !== 'Whitelist:');
        setWhitelist(lines);
      } else {
        setWhitelist([]);
      }
    } catch (error) {
      console.error('[WhitelistSettings] Failed to fetch whitelist:', error);
      setWhitelist([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWhitelist();
  }, [selectedServerInstance]);

  const handleAdd = async () => {
    const steamId = newSteamId.trim();
    if (!steamId) return;

    const pgSteamId = steamId.startsWith('steam_')
      ? steamId
      : `steam_${steamId}`;

    await window.electron.ipcRenderer.invoke(
      Channels.sendRCONCommand,
      selectedServerInstance,
      `whitelist_add ${pgSteamId}`,
    );
    setNewSteamId('');
    fetchWhitelist();
  };

  const handleRemove = async (steamId: string) => {
    await window.electron.ipcRenderer.invoke(
      Channels.sendRCONCommand,
      selectedServerInstance,
      `whitelist_remove ${steamId}`,
    );
    fetchWhitelist();
  };

  return (
    <AlertDialog.Content style={{ maxWidth: 500 }}>
      <AlertDialog.Title>{t('WhitelistManagement')}</AlertDialog.Title>
      <AlertDialog.Description>
        <div className="flex items-center gap-2 mb-3">
          <TextField.Root
            placeholder="Steam ID"
            size="2"
            value={newSteamId}
            onChange={(e) => setNewSteamId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            style={{ flex: 1 }}
          />
          <Button size="2" onClick={handleAdd} disabled={!newSteamId.trim()}>
            {t('Add')}
          </Button>
          <Button
            size="2"
            variant="soft"
            color="gray"
            onClick={fetchWhitelist}
            disabled={loading}
          >
            <MdRefresh size={16} />
          </Button>
        </div>
        <ScrollArea
          scrollbars="vertical"
          style={{ height: 300 }}
          className="pt-2"
        >
          {whitelist.length === 0 ? (
            <Theme
              appearance="dark"
              style={{ background: 'inherit' }}
            >
              <Text color="gray" size="2">
                {t('WhitelistEmpty')}
              </Text>
            </Theme>
          ) : (
            <ul className="flex flex-col gap-1">
              {whitelist.map((steamId) => (
                <li
                  key={steamId}
                  className="flex items-center justify-between px-2 py-1 rounded hover:bg-white/5"
                >
                  <Text size="2" style={{ fontFamily: 'monospace' }}>
                    {steamId}
                  </Text>
                  <Button
                    size="1"
                    variant="ghost"
                    color="red"
                    onClick={() => handleRemove(steamId)}
                  >
                    <MdDelete size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </AlertDialog.Description>
      <Flex gap="3" mt="4" justify="end">
        <AlertDialog.Cancel>
          <Button variant="soft" color="gray">
            {t('Close')}
          </Button>
        </AlertDialog.Cancel>
      </Flex>
    </AlertDialog.Content>
  );
}
