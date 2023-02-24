import { createPresence, IChannel } from '@yomo/presence';
import { useEffect, useRef, useState } from 'react';

function connect() {
  const id = Math.random().toString();
  const avatar = Math.random() > 0.5 ? `https://robohash.org/${id}` : void 0;
  const presencePromise = createPresence({
    url: process.env.NEXT_PUBLIC_PRESENCE_URL,
    publicKey: process.env.NEXT_PUBLIC_PRESENCE_PUBLIC_KEY,
    id,
    appId: process.env.NEXT_PUBLIC_PRESENCE_APP_ID,
  });
  return { id, avatar, presencePromise };
}

export default function Home() {
  const [channel, setChannel] = useState<IChannel | null>(null);
  const [msgs, setMsgs] = useState<{ msg: string; id: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [id, setId] = useState<string>('');
  useEffect(() => {
    (async () => {
      const { presencePromise, id } = connect();
      setId(id);
      const presence = await presencePromise;
      console.log('presence connected');
      const channel = presence.joinChannel('test');
      channel.subscribe('msg', (peer: { msg: string; id: string }) => {
        setMsgs((msgs) => [...msgs, peer]);
      });
      setChannel(channel);
    })();
  }, []);
  if (!channel) return <div>connecting...</div>;
  return (
    <div>
      <h1>Presence with Next.js 13</h1>
      {msgs.map((msg, i) => (
        <div key={i}>
          {msg.id}: {msg.msg}
        </div>
      ))}
      <input type="text" ref={inputRef} className="input" />
      <button
        className="button"
        onClick={() =>
          channel.broadcast('msg', { msg: inputRef.current?.value || '', id })
        }
      >
        send a message
      </button>
    </div>
  );
}
