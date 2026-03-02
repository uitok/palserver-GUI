import {
  AlertDialog,
  Button,
  Flex,
  ScrollArea,
  TextField,
} from '@radix-ui/themes';
import gamePalsOrigin from '../../../../../../../assets/game-data/data/pals.json';
import { useState } from 'react';
import { MdSearch } from 'react-icons/md';
import PalItem from '../GivePalToPlayer/PalItem/PalItem';
import useTranslation from '../../../../../hooks/translation/useTranslation';
import Channels from '../../../../../../main/ipcs/channels';
import useSelectedServerInstance from '../../../../../redux/selectedServerInstance/useSelectedServerInstance';
import formatLocale from '../../../../../utils/formatLocale';
import { ActionType } from '../PlayerMoreAction';

const gamePals: Record<string, { id: string; name: string; image: string }> = {};

for (const key in gamePalsOrigin) {
  gamePals[key] = gamePalsOrigin[key];
  gamePals['BOSS_' + key] = {
    id: 'BOSS_' + key,
    name: gamePalsOrigin[key].name,
    image: gamePalsOrigin[key].image,
  };
}

export default function GiveEggToPlayer({
  actionType,
  setActionType,
  playerId,
  steamId,
  name,
}: {
  actionType: ActionType;
  setActionType: (type: ActionType) => void;
  playerId: string;
  steamId: string;
  name: string;
}) {
  const { t } = useTranslation();

  const pgSteamId = 'steam_' + steamId.slice(6);

  const { selectedServerInstance } = useSelectedServerInstance();

  const [palsAmount, setPalsAmount] = useState(
    Object.keys(gamePals).map((pal) => ({ [pal]: 0 })),
  );

  const [searchText, setSearchText] = useState('');
  const [palLevel, setPalLevel] = useState(1);

  const handleGiveEgg = () => {
    palsAmount.forEach((palAmount) => {
      const pal = Object.keys(palAmount)[0];
      const amount = Object.values(palAmount)[0];

      if (amount) {
        for (let i = 0; i < amount; i++) {
          window.electron.ipcRenderer.invoke(
            Channels.sendRCONCommand,
            selectedServerInstance,
            `giveegg ${pgSteamId} ${pal} ${palLevel}`,
          );
        }
      }
    });
    setPalsAmount(Object.keys(gamePals).map((item) => ({ [item]: 0 })));
  };

  return (
    <AlertDialog.Content>
      <AlertDialog.Title>
        {formatLocale(t('GiveEggDesc'), [name])}
      </AlertDialog.Title>
      <AlertDialog.Description>
        <div className="flex items-center gap-2 mb-2">
          <label>{t('PalLevel')}:</label>
          <TextField.Root
            style={{ width: 80 }}
            size="2"
            type="number"
            value={palLevel}
            onChange={(e) => setPalLevel(Number(e.target.value))}
          />
        </div>
        <ScrollArea
          scrollbars="vertical"
          style={{ height: '60vh' }}
          className="pt-2"
        >
          <ul className="flex flex-col">
            {Object.values(gamePals)
              ?.filter((item) => {
                return item.id.startsWith('BOSS_')
                  ? t(item.id.slice(5))
                      ?.toUpperCase()
                      ?.includes(searchText?.toUpperCase())
                  : t(item.id)
                      ?.toUpperCase()
                      ?.includes(searchText?.toUpperCase());
              })
              ?.map(
                (item) =>
                  item && (
                    <PalItem
                      type={item.id.startsWith('BOSS_') ? 'boss' : 'pal'}
                      pal={item}
                      amount={
                        Object.values(
                          palsAmount.filter(
                            (i) => Object.keys(i)[0] === item.id,
                          )[0],
                        )[0]
                      }
                      onAmountChange={(a) => {
                        setPalsAmount([
                          ...palsAmount.filter(
                            (pal) => Object.keys(pal)[0] !== item.id,
                          ),
                          { [item.id]: a },
                        ]);
                      }}
                    />
                  ),
              )}
          </ul>
        </ScrollArea>
      </AlertDialog.Description>
      <Flex gap="3" mt="4" justify="between">
        <TextField.Root
          placeholder={t('SearchPal')}
          size="2"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        >
          <TextField.Slot>
            <MdSearch height="16" width="16" />
          </TextField.Slot>
        </TextField.Root>
        <div className="flex gap-4">
          <Button
            onClick={() => {
              setActionType('list');
            }}
            variant="soft"
            color="gray"
          >
            {t('Back')}
          </Button>
          {palsAmount
            .map((v) => Object.values(v)[0])
            .reduce((a, b) => a + b) !== 0 && (
            <Button color="yellow" onClick={handleGiveEgg}>
              {t('Give')}
            </Button>
          )}
        </div>
      </Flex>
    </AlertDialog.Content>
  );
}
