import fetch from 'node-fetch';
import { createPresence } from '../src/presence';
import { WebTransportPolyfill } from '@yomo/webtransport-polyfill';
var streams = require('web-streams-polyfill/ponyfill');

// @ts-ignore
globalThis.fetch = fetch;
// @ts-ignore
globalThis.WebTransport = WebTransportPolyfill;
// @ts-ignore
globalThis.WritableStream = streams.WritableStream;
// @ts-ignore
globalThis.ReadableStream = streams.ReadableStream;

describe('Presence', () => {
  it('create presence', async () => {
    const presence = await createPresence({
      url: 'wss://prscd2.allegro.earth/v1',
      publicKey: 'kmJAUnCtkWbkNnhXYtZAGEJzGDGpFo1e1vkp6cm',
    });
    expect(presence).toBeDefined();
  });

  it('join channel', async () => {
    const presence = await createPresence({
      url: 'wss://prscd2.allegro.earth/v1',
      publicKey: 'kmJAUnCtkWbkNnhXYtZAGEJzGDGpFo1e1vkp6cm',
    });

    const groupHugChannel = presence.joinChannel('group-hug', { id: '123' });
    expect(groupHugChannel).toBeDefined();
  });

  it('subscribePeers', async () => {
    const p1 = await createPresence({
      url: 'wss://prscd2.allegro.earth/v1',
      publicKey: 'kmJAUnCtkWbkNnhXYtZAGEJzGDGpFo1e1vkp6cm',
      id: '1',
    });
    const p2 = await createPresence({
      url: 'wss://prscd2.allegro.earth/v1',
      publicKey: 'kmJAUnCtkWbkNnhXYtZAGEJzGDGpFo1e1vkp6cm',
      id: '2',
    });

    p1.joinChannel('group-hug', { id: 'p1' });
    const groupHugChannel = p2.joinChannel('group-hug', { id: 'p2' });
    groupHugChannel.subscribePeers((peers: any) => {
      console.log(peers);
      expect(peers).toEqual([{ id: '1' }]);
    });
  });
});
