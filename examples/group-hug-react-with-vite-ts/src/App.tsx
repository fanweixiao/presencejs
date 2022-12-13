import React, { useState } from 'react';
import { createPresence } from '@yomo/presence';
import { faker } from '@faker-js/faker';
import GroupHug from '@yomo/group-hug-react';
import '@yomo/group-hug-react/dist/style.css';

const id = Math.random().toString();
const avatar = Math.random() > 0.5 ? `https://robohash.org/${id}` : '';
const randomName = faker.name.fullName();
const presence = createPresence({
  url: 'https://prscd2.allegro.earth/v1',
  publicKey: 'kmJAUnCtkWbkNnhXYtZAGEJzGDGpFo1e1vkp6cm',
  id,
  appId: 'lzq',
});

const App = () => {
  const [darkMode, setDarkMode] = useState(true);
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
      <GroupHug
        presence={presence}
        id={id}
        avatar={avatar}
        name={randomName}
        darkMode={darkMode}
      />
    </div>
  );
};

export default App;
