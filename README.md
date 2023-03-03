<p align="center">
    <img alt="presencejs logo " src="/logo.png"><br/>
    <a aria-label="NPM version" href="https://www.npmjs.com/package/@yomo/presence">
        <img alt="NPM version" src="https://badgen.net/npm/v/@yomo/presence">
    </a>
    <a aria-label="License" href="https://github.com/yomorun/presencejs/blob/main/LICENSE">
        <img alt="License" src="https://badgen.net/npm/license/@yomo/presence">
    </a><br/><br/>
    <a href="https://www.producthunt.com/posts/cursor-chat-anywhere?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-cursor-chat-anywhere" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=333289&theme=dark" alt="Cursor Chat Anywhere - Add Figma like cursor chat to your own products | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
</p>

## 🧬 Introduction

`Presencejs` is a JavaScript library that allows you to build real-time web applications with secure, low-latency, and high-performance geo-distributed architecture.

- **Geo-distributed** Deploy your realtime backend close to users all over the world
- **WebTransport** [Introduction: WebTransport is an API offering low-latency, bidirectional, client-server messaging.](https://web.dev/webtransport/)
  - Fallback to WebSocket if WebTransport connection cannot be established
- **Secure**, **low-latency** and **high-performance**
- Support **unreliable** and **reliable** data transmitting
- **Real-time** and **collaboritve** experience
- **Easy** to use
- **Free** for self-managed hosting

...and a lot more.

With `presencejs`, components will get data flow in real time. Thus, the UI will be always **fast** and **reactive**.

## 🌟 Showcase

Some React Serverless Components built with `presencejs`:

- GroupHug
  - Preview: 
  - Source code: 
- LiveCursor
  - Preview: 
  - Source code: 

## 🥷🏼 Quick Start

### 1. Add `presencejs` to your web app

Using npm

```
$ npm i --save @yomo/presencejs
```

Using yarn

```
$ yarn add @yomo/presencejs
```

Using pnpm

```
$ pnpm i @yomo/presencejs
```

#### Create a `Presence` instance

```js
import Presence from '@yomo/presencejs';

// create an instance.
const yomo = new Presence('https://prsc.yomo.dev', {
    auth: {
        // Certification Type
        type: 'token',
        // Api for getting access token
        endpoint: '/api/presence-auth',
    },
});

yomo.on('connected', () => {
    console.log('Connected to server: ', yomo.host);
});
```

#### Broadcast messages to the other peers


#### Subscribe messages from the other peers


### 2. Start `prscd` backend service

see `prscd`

## 🤹🏻‍♀️ API

| Methods of instance | Description                                                     | Type                                                |
| ------------------- | --------------------------------------------------------------- | --------------------------------------------------- |
| `on`                | Function to handle response for given event from server         | `on<T>(event: string, cb: (data: T) => void): void` |
| `on$`               | Same as the `on` method, returns an observable response         | `on$<T>(event: string): Observable<T>`              |
| `send`              | Function for sending data to the server                         | `send<T>(event: string, data: T)`                   |
| `toRoom`            | Enter a room                                                    | `toRoom(roomName: string): Presence`                |
| `ofRoom`            | Function for sending data streams to the server                 | `ofRoom(roomName: string, event: string)`           |
| `close`             | A connection to YoMo can be closed once it is no longer needed. | `close(): void`                                     |

## 🏡 Self-managed hosting

### Tutorial: Single node on Digital Ocean

### Tutorial: Geo-distributed system on AWS

### Tutorial: Geo-distributed system on Azure

## License

The MIT License.
