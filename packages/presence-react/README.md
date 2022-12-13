# 安装

## 安装 npm 包

运行以下命令来安装 precence 包：

```bash
npm install @yomo/presence @yomo/presence-react
```

@yomo/presence 包含与 Presence 服务器交互。
@yomo/presence-react 包含 React Provider 和 Hook，让开发者更容易使用 presence。

## 连接到 presence 服务器

为了使用 presence，我们需要注册并获得一个 API 密钥。 [创建一个帐户](https://presencejs.yomo.run/)，然后在[仪表板](https://presencejs.yomo.run/console)中创建一个 App，创建成功后，我们可以看到 App ID、App secret 和 Public key。
现在我们可以在应用程序中创建 src/presence.config.js 文件，并使用公钥来创建一个 presence 客户端，代码如下所示。
**presence.config.js**

```javascript
import { createPresence } from '@yomo/presence';

const presence = createPresence({
  publicKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
});
```

## 连接到 presence channel

presence 使用 channel 的概念，让人们可以进行点对点的互通。要创建多人应用，必须将多个用户连接到同一个 channel。
我们不直接使用 presence 提供的 API，而是使用 @yomo/presence-react 中的 createChannelContext 来创建一个 ChannelProvider，这样可以让我们在 React 应用中更容易使用 presence。
**src/presence.config.js**

```javascript
import { createPresence } from '@yomo/presence';
import { createChannelContext } from '@yomo/presence-react';

const presence = createPresence({
  publicKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
});

export const { ChannelProvider } = createChannelContext(presence);
```

您可能想知道为什么我们要创建我们的 Providers 和 Hooks createChannelContext 而不是直接从 @presence/client. 这允许 TypeScript 用户在一个独特的位置定义他们的 Presence 类型一次——允许他们在其他地方使用这些钩子时获得很好的自动完成体验。
我们现在可以直接从我们的 src/presence.config.js 文件中导入 ChannelProvider。然后设置 channel id，这是 channel 的唯一标识。
在这里我们使用 my-channel 作为 channel id。
当组件渲染完成时进入 channel，并在组件卸载时离开 channel。
**pages/index.js**

```jsx
import App from './App';
import { Suspense } from '@yomo/presence-react';
import { ChannelProvider } from './presence.config.js';

function Index() {
  return (
    <ChannelProvider id="my-channel">
      <Suspense fallback={<div>Loading...</div>}>{() => <App />}</Suspense>
    </ChannelProvider>
  );
}
```

这里我们使用了 ClientSideSuspense 组件。
这是一个 @yomo/presence-react 提供的组件，通过将我们的应用程序包装在 Suspense 中来使用 React 的 [Suspense](https://reactjs.org/docs/react-api.html#suspense) 组件的功能。
将一个组件传递给 Suspense 的 fallback 属性，这个组件会在 Presence 连接并准备就绪之前将一直显示。Suspense 也可以进一步向下移动组件树，当应用程序的 Presence 连接在准备好时准确加载组件。
使用 @yomo/presence-react 中的 Suspense，而不是 React 的 Suspense，主要是为了支持服务端渲染的项目。

# 获取 Channel 中的其他用户

现在 Provider 已经设置好了，我们可以开始使用 presence 的 Hook 了。我们要添加的第一个是 usePeers，它可以获取到当前 channel 中的其他用户。
我们可以从 presence.config.js 的 createChannelContext 中导出它。
**presence.config.js**

```javascript
import { createPresence } from '@yomo/presence';
import { createChannelContext } from '@yomo/presence-react';
const presence = createPresence({
  publicApiKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
});
export const { ChannelProvider, usePeers } = createChannelContext(presence);
```

要显示 channel 中有多少其他用户，可以按以下方式使用 usePeers。

```tsx
import { usePeers } from './presence.config';

function App() {
  const peers = usePeers();

  return <div>目前有 {peers.length} 个人在当前 channel.</div>;
}
```

# 定义初始状态

在大多数协作应用中，每个用户都拥有自己的状态，然后与他人共享。例如，在使用多人头像的应用程序中，每个用户的头像和是否离开浏览器是他们的状态。在 Presence 中，我们称之为 state。
我们可以使用 state 保存我们希望与他人共享的任何数据。一个例子是用户头像和是否离开浏览器：

```typescript
const state = {
  avatar: 'xxx',
  away: false,
};
```

要开始使用 state，我们要在 ChannelProvider 中设置 initialState 属性。

```tsx
import App from './App';
import { Suspense } from '@yomo/presence-react';
import { ChannelProvider } from './presence.config.js';

function Index() {
  return (
    <ChannelProvider
      id="my-channel"
      initialState={{
        avatar: 'xxx',
        away: false,
      }}
    >
      <App />
    </ChannelProvider>
  );
}
```

# 更新用户状态

我们可以使用 useUpdateMyState Hook 来更新状态。
首先，在 createChannelContext 中导出 useUpdateMyState Hook。

```typescript
import { createPresence } from '@yomo/presence';
import { createChannelContext } from '@yomo/presence-react';

const presence = createPresence({
  publicApiKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
});
export const { ChannelProvider, usePeers, useUpdateMyState } =
  createChannelContext(presence);
```

接下来，每当检测到 visibilityChange 事件时，将会调用 updateMyState 将 away 设置为 document.hidden。

```tsx
import { useUpdateMyState } from './presence.config';

function App() {
  const updateMyState = useUpdateMyState();
  useState(() => {
    document.addEventListener(
      'visibilityChange',
      () => {
        updateMyState({
          away: document.hidden,
        });
      },
      false
    );
  }, []);

  return <div>{/* ... */}</div>;
}
```

# 获取其他用户的状态

要获取每个用户的头像与离线状态，我们可以继续使用 usePeers。
现在我们来渲染每个用户，并获取他们的状态数据。如果 away 为 true，则表示用户不在当前屏幕上，因此我们把它设置为半透明状态。

```tsx
import { useUpdateMyState, usePeer } from "./presence.config";

function App() {
  const updateMyState = useUpdateMyState();
  const peer = usePeers();
  useState(() => {
    document.addEventListener('visibilityChange', () => {
      updateMyState({
        away: document.hidden
      })
    }, false);
  }, [])

  return (
    <div>
      {
        peer.map(({ id, away, avatar } => (
          <Avatar key={id} away={away} avatar={avatar}></Avatar>
        )))
      }
    </div>
  );
}
```

# 获取自身状态

要获取自身状态的话，使用 useMyState Hook。
同样需要在 createChannelContext 中导出。

```typescript
import { createPresence } from '@yomo/presence';
import { createChannelContext } from '@yomo/presence-react';

const presence = createPresence({
  publicApiKey: 'xxxxxxxxxxxxxxxxxxxxxxxx',
});
export const { ChannelProvider, usePeers, useMyState, useUpdateMyState } =
  createChannelContext(presence);
```

然后在组件中使用。

```tsx
import { useMyState } from "./presence.config";

function App() {
  // ...
  const myState = useMyState();
  return (
    // ...
  );
}
```
