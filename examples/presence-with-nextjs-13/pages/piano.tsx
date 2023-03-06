import { createPresence, IChannel } from '@yomo/presence';
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import * as Tone from 'tone';
// @ts-ignore
import note from 'midi-note';
import { connect } from '@/utils/presence';
import { Loading } from '@/components/Loading';

export default function Piano() {
  const [channel, setChannel] = useState<IChannel | null>(null);
  const pianoRef = useRef<HTMLDivElement>(null);
  const [nexusUILoaded, setNexusUILoaded] = useState(false);
  const [log, setLog] = useState<
    {
      id: string;
      text: string;
    }[]
  >([]);
  const [id, setId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { presencePromise, id } = connect();
      const presence = await presencePromise;
      console.log('presence connected');
      setId(id);
      const channel = presence.joinChannel('test');

      const activeSynths: any = {};
      channel.subscribe(
        'attack',
        (peer: { key: string; state: boolean; id: string }) => {
          if (peer.id === id) {
            console.log(
              "**should not exists becuase prscd doesn't send to itself"
            );
            return;
          }
          console.log('attack', peer);
          if (peer.state) {
            console.log('==', activeSynths[peer.key]);
            if (!activeSynths[peer.key]) {
              activeSynths[peer.key] = new Tone.Synth().toMaster();
            }
            activeSynths[peer.key].triggerAttack(note(peer.key));
            const min = new Date().getMinutes();
            const sec = new Date().getSeconds();
            const id = Math.random().toString(36).substring(2, 8);
            setLog((log) => [
              ...log,
              {
                id,
                text: `${min}:${sec} ${peer.id} attack ${note(peer.key)}`,
              },
            ]);
          } else {
            if (activeSynths[peer.key]) {
              activeSynths[peer.key].triggerRelease();
            }
          }
        }
      );
      setChannel(channel);
    })();
    return () => {
      channel?.leave();
      setChannel(null);
    };
  }, []);

  useEffect(() => {
    if (nexusUILoaded && pianoRef.current && channel) {
      // @ts-ignore
      if (!window.Nexus) return;
      // @ts-ignore
      const piano = new window.Nexus.Piano(pianoRef.current, {
        size: [300, 125],
        mode: 'toggle',
        lowNote: 72,
        highNote: 84,
      });

      document.addEventListener('keydown', (event) => {
        // @ts-ignore
        const keyIndex = keyMapper[event.key];
        console.log('>>keyIndex', keyIndex);
        console.log('>>piano.keys[keyIndex]', piano.keys[keyIndex]);
        keyIndex !== undefined && !piano.keys[keyIndex]._state.state
          ? piano.toggleIndex(keyIndex, true)
          : null;
      });

      document.addEventListener('keyup', (event) => {
        // @ts-ignore
        const keyIndex = keyMapper[event.key];
        keyIndex !== undefined && piano.keys[keyIndex]._state.state
          ? piano.toggleIndex(keyIndex, false)
          : null;
        console.log('<<keyIndex', keyIndex);
        console.log('<<piano.keys[keyIndex]', piano.keys[keyIndex]);
      });

      const activeSynths: any = {};

      piano.on('change', (k: any) => {
        console.log('($change) k:', k);
        if (k.state) {
          if (!activeSynths[k.note]) {
            console.log(`($change) activeSynths[${k.note}] = new XXX`);
            activeSynths[k.note] = new Tone.Synth().toMaster();
          }
          activeSynths[k.note].triggerAttack(note(k.note));
          const min = new Date().getMinutes();
          const sec = new Date().getSeconds();
          const logId = Math.random().toString(36).substring(2, 8);
          setLog((log) => [
            ...log,
            {
              id: logId,
              text: `${min}:${sec} ${id} attack ${note(k.note)}`,
            },
          ]);
        } else {
          activeSynths[k.note].triggerRelease();
        }
        channel?.broadcast('attack', {
          id,
          key: k.note,
          state: k.state,
        });
      });
    }
  }, [channel, nexusUILoaded]);

  if (!channel) {
    return <Loading />;
  }

  return (
    <div>
      <Script
        src="https://cdn.jsdelivr.net/npm/nexusui@latest/dist/NexusUI.js"
        onLoad={() => {
          setNexusUILoaded(true);
        }}
      ></Script>
      <div>
        {/* title area */}
        <div className="flex items-center justify-center w-screen h-16 bg-gray-800">
          <div className="container flex items-center justify-between gap-2 px-4 w-[1200px]">
            <h1>
              <span className="text-2xl font-bold text-white">
                <span className="text-blue-400">Presence</span> Piano
              </span>
            </h1>
            <div className="flex items-center gap-2 text-white">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
              <div className="text-xl font-bold">{id}</div>
            </div>
          </div>
        </div>
        {/* layout area, left is piano, right is keyboard tips and log */}
        <div className="flex flex-row bg-gray-100 w-screen h-[calc(100vh-4rem)]">
          {/* piano */}
          <div className="flex flex-col items-center justify-center w-1/2 h-full">
            <div ref={pianoRef}></div>
          </div>
          {/* key tips and log */}
          <div className="flex flex-col items-center justify-center w-1/2 h-full">
            {/* key tips */}
            <div className="flex flex-col items-center justify-center w-full p-12 overflow-auto bg-white h-1/2">
              {/* key tips, twitter style */}
              <div className="flex flex-col items-center justify-center h-full px-4 py-2 text-gray-500 border border-gray-300 rounded-md text-md">
                <div className="flex items-center justify-center w-full h-8 text-gray-700 border-b border-gray-300">
                  <span className="font-bold">Key</span>
                  <span className="flex-grow w-24 "></span>
                  <span className="font-bold">Note</span>
                </div>
                {Object.keys(keyMapper).map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-center w-full h-8"
                  >
                    <span className="font-bold">{key}</span>
                    <span className="flex-grow"></span>
                    <span className="font-bold">
                      {note((keyMapper as any)[key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            {/* log */}
            <div className="flex flex-col items-center justify-center w-full overflow-auto bg-white h-1/2">
              {/* log, twitter style */}
              <div className="flex flex-col items-center justify-center w-full h-full text-sm text-gray-500">
                {log.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-center w-full h-8 border-b border-gray-300"
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const keyMapper = {
  a: 0,
  w: 1,
  s: 2,
  e: 3,
  d: 4,
  f: 5,
  t: 6,
  g: 7,
  y: 8,
  h: 9,
  u: 10,
  j: 11,
  k: 12,
};
