import { createPresence } from '@yomo/presence';
import GroupHug from '@yomo/group-hug-react';
import { useEffect, useState } from 'react';
import { faker } from '@faker-js/faker';
import '@yomo/group-hug-react/dist/style.css';

const id = Math.random().toString();
const avatar = `https://robohash.org/${id}`;
const randomName = faker.name.fullName();

export default function Home() {
  const [presence, setPresence] = useState<any>();
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const presence = createPresence({
      url: 'https://prscd2.allegro.earth/v1',
      publicKey: 'GIctGofSPwjGEYuPztgvvuBfKZsnPcad2te1mjdum',
      id,
      appId: 'lzq',
    });
    setPresence(presence);
  }, []);
  return (
    <div
      style={{
        padding: '200px',
        background: darkMode ? 'black' : 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        gap: '20px',
      }}
    >
      <button
        style={{ color: darkMode ? 'white' : 'black' }}
        onClick={() => setDarkMode(!darkMode)}
      >
        {darkMode ? 'close dark mode' : 'open dark mode'}
      </button>

      {presence ? (
        <GroupHug
          presence={presence}
          id={id}
          avatar={avatar}
          name={randomName}
          darkMode={darkMode}
        />
      ) : null}
    </div>
  );
}
