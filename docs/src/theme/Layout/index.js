import React, { useEffect, useState } from 'react';
import Layout from '@theme-original/Layout';
import { createPresence } from '@yomo/presence';
import GroupHug from '@yomo/group-hug-react';

import '@yomo/group-hug-react/dist/style.css';

const id = Math.random().toString();
const avatar = `https://robohash.org/${id}`;

export default function LayoutWrapper(props) {
  const [presence, setPresence] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(mutation => {
      console.log(123);
      setDarkMode(mutation[0].target.dataset.theme === 'dark');
    });

    observer.observe(window.document, {
      attributes: true,
      subtree: true,
      characterData: true,
      attributeFilter: ['data-theme'],
    });

    const presence = createPresence({
      url: 'https://prscd2.allegro.earth/v1',
      publicKey: 'kmJAUnCtkWbkNnhXYtZAGEJzGDGpFo1e1vkp6cm',
      id,
      appId: 'lzq',
    });
    setPresence(presence);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <Layout {...props} />
      {presence && (
        <div className="fixed right-[10vw] top-[1.5vh] z-[1000]">
          <GroupHug
            presence={presence}
            id={id}
            avatar={avatar}
            name="visitor"
            darkMode={darkMode}
          ></GroupHug>
        </div>
      )}
    </>
  );
}
