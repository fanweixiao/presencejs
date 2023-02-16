import { Channel } from './channel';
import {
  IChannel,
  InternalPresenceOptions,
  IPresence,
  Metadata,
  PresenceOptions,
} from './type';
import { randomId } from './utils';
import WebTransport from '@yomo/webtransport-polyfill';

export class Presence implements IPresence {
  #url: string = '';
  #metadata: Metadata;
  #channels: Map<string, IChannel> = new Map();
  #transport: any;
  #options: InternalPresenceOptions;
  #onReadyCallbackFn: Function = () => {};
  #onErrorCallbackFn: Function = () => {};
  #onClosedCallbackFn: Function = () => {};

  constructor(options: InternalPresenceOptions) {
    this.#metadata = {
      id: options.id,
    };
    this.#options = options;
    (async () => {
      this.#url = await this.#formatUrl();
      this.#connect();
    })();
  }

  async #formatUrl() {
    if ('appId' in this.#options && 'publicKey' in this.#options) {
      return this.#formatUrlWithPublicKey();
    } else if (
      'appId' in this.#options &&
      'appSecret' in this.#options &&
      'endpoint' in this.#options
    ) {
      return await this.#formatUrlWithIdAndSecret();
    }
    throw new Error('Invalid options');
  }

  async #formatUrlWithIdAndSecret() {
    const response = await fetch(this.#options.endpoint as string);
    const data = await response.json();
    return `${this.#options.url}?token=${data.token}&id=${this.#metadata.id}`;
  }

  #formatUrlWithPublicKey() {
    return `${this.#options.url}?publickey=${this.#options.publicKey}&id=${
      this.#metadata.id
    }&app_id=${this.#options.appId}`;
  }

  onReady(callbackFn: Function) {
    this.#onReadyCallbackFn = callbackFn;
  }
  onError(callbackFn: Function) {
    this.#onErrorCallbackFn = callbackFn;
  }
  onClosed(callbackFn: Function) {
    this.#onClosedCallbackFn = callbackFn;
  }

  joinChannel(channelId: string, metadata?: Metadata) {
    this.#metadata = {
      ...this.#metadata,
      ...(metadata || {}),
    };
    const channel = new Channel(channelId, this.#metadata, this.#transport, {
      reliable: this.#options.reliable,
    });
    this.#channels.set(channelId, channel);
    return channel;
  }

  leaveChannel(channelId: string) {
    const channel = this.#channels.get(channelId);
    if (channel) {
      channel.leave();
    }
  }

  #connect() {
    this.#transport = new window.WebTransport(this.#url);

    this.#transport.ready
      .then(() => {
        this.#onReadyCallbackFn();
      })
      .catch((e: Error) => {
        this.#onErrorCallbackFn(e);
      });

    this.#transport.closed
      .then(() => {
        this.#onClosedCallbackFn();
        this.#channels.forEach((channel) => {
          channel.leave();
        });
      })
      .catch((e: Error) => {
        console.log(e);
        setTimeout(() => {
          // force to use the polyfill
          window.WebTransport = WebTransport;
          this.#connect();
        }, 2_000);
      });
  }
}

const defaultOptions = {
  id: randomId(),
  url: 'https://prscd2.allegro.earth/v1',
  reliable: false,
};

export function createPresence(options: PresenceOptions): Promise<IPresence>;
export function createPresence(options: PresenceOptions) {
  return new Promise((resolve) => {
    let id = options?.id || defaultOptions.id;
    let url = options?.url || defaultOptions.url;
    let reliable = options?.reliable || defaultOptions.reliable;
    const internalOptions: InternalPresenceOptions = {
      ...options,
      id,
      url,
      reliable,
    };
    const presence = new Presence(internalOptions);
    presence.onReady(() => {
      resolve(presence);
    });
    // presence.onClosed(() => {
    //   reject('closed');
    // });
    // presence.onError((e: any) => {
    //   reject(e);
    // });
  });
}
