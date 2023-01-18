import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPresence } from '@yomo/presence';
import { faker } from '@faker-js/faker';
import LiveCursor from './index';
import './entry.css';

const domContainer = document.querySelector('#app');
const root = createRoot(domContainer);

const id = Math.random().toString();
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
        height: '100%',
        width: '100%',
      }}
    >
      <button
        style={{
          color: darkMode ? 'black' : 'white',
          background: 'pink',
          borderRadius: '4px',
          padding: '20px',
        }}
        onClick={() => {
          setDarkMode(!darkMode);
        }}
      >
        {darkMode ? 'close dark mode' : 'open dark mode'}
      </button>
      <LiveCursor presence={presence} id={id} />
    </div>
  );
};

root.render(<App />);
