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

`Presencejs` is a JavaScript library that enables the creation of real-time web applications with a secure, low-latency, and high-performance geo-distributed architecture.

Key Features:

- **Geo-distributed Architecture**: Deploy your real-time backend close to users all over the world for better performance.
- **WebTransport Support**: WebTransport is an new API that offers low-latency, bidirectional, client-server messaging.
- **Secure**, **low-latency**, and **high-performance**: PresenceJS prioritizes security, speed, and performance for a seamless user experience.
- **Real-time and collaborative experience**: With PresenceJS, components receive data flow in real time, ensuring fast and reactive UI by offering the flexibility to send either unreliable or reliable data
- **Easy to use**: PresenceJS is simple to implement, making it an accessible solution for developers.
- **Free for self-managed hosting**: PresenceJS is free to use for self-managed hosting, making it an affordable choice for projects of any size.

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
