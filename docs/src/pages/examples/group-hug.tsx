import Editor from '@monaco-editor/react';
import Layout from '@theme/Layout';
import React, { useState } from 'react';

export default function GroupHug() {
  const [fileName, setFileName] = useState('index.jsx');

  const [files, setFiles] = useState({
    'index.jsx': {
      name: 'index.jsx',
      language: 'javascript',
      value: `import { ChannelProvider } from './presence.config';

ReactDOM.render(
  <ChannelProvider id="channel-id" initialState={initialState}>
    <App />
  </ChannelProvider>,
  document.getElementById('root')
);
`,
    },
    'presence.config.js': {
      name: 'presence.config.js',
      language: 'javascript',
      value: `import { createPresence } from '@yomo/presence';
import { createChannelProvider } from '@yomo/presence-react';

const presence = createPresence({
  publicKey: process.env.PRESENCE_PUBLIC_KEY,
});

export const {
  ChannelProvider,
  usePeers,
  useMyState,
  useUpdateMyState,
} = createChannelProvider({
  presence,
});
`,
    },
  });

  const file = files[fileName];

  return (
    <Layout
      title={`group hug`}
      description="Description will go into a meta tag in <head />"
    >
      <div className="px-40 py-20">
        <div className="mb-10">
          <h1 className="pb-10">Group Hug</h1>
          <div className="text-lg">
            此示例展示了如何使用 presence 和 React 构建实时用户实时头像。
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex flex-col p-4 gap-4 items-start w-[200px]">
            {Object.keys(files).map(name => (
              <button
                key={name}
                disabled={fileName === name}
                className={`${fileName === name ? 'text-purple-400' : ''}`}
                onClick={() => setFileName(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="flex-1">
            <Editor
              height="80vh"
              theme="vs-dark"
              path={file.name}
              defaultLanguage={file.language}
              defaultValue={file.value}
              options={{
                fontSize: 16,
              }}
            />
          </div>
          <div className="flex-1">playground</div>
        </div>
      </div>
    </Layout>
  );
}
