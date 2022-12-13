import { createPresence } from '../../../packages/presence/dist/index';
import { createChannelContext } from '../../../packages/presence-react/dist/index';
import { getRandomName } from './getRandomName';

export const id = String(Math.floor(Math.random() * 100_000));
export const name = getRandomName(3);

const presence = createPresence({
  url: `https://prscd2.allegro.earth/v1`,
  publicKey: 'ooo',
  id,
  appId: 'cc',
});

export const {
  ChannelProvider,
  usePeers,
  useMyState,
  useUpdateMyState,
} = createChannelContext(presence);
