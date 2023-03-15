import { Channel } from './channel';
import {
  IChannel,
  InternalPresenceOptions,
  IPresence,
  State,
  PresenceOptions,
} from './type';
import { randomId } from './utils';
import WebTransport from '@yomo/webtransport-polyfill';
import { Logger } from './logger';

export class Presence implements IPresence {
  #url: string = '';
  #metadata: State;
  #channels: Map<string, IChannel> = new Map();
  #transport: any;
  #options: InternalPresenceOptions;
  #logger: Logger;
  #onReadyCallbackFn: Function = () => {};
  #onErrorCallbackFn: Function = () => {};
  #onClosedCallbackFn: Function = () => {};

  constructor(options: InternalPresenceOptions) {
    this.#metadata = {
      id: options.id,
    };
    this.#options = options;
    this.#logger = new Logger({
      enabled: options.debug,
      module: 'presence',
    });
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

  joinChannel(channelId: string, metadata?: State) {
    this.#metadata = {
      ...this.#metadata,
      ...(metadata || {}),
    };
    const channel = new Channel(channelId, this.#metadata, this.#transport, {
      reliable: this.#options.reliable,
      debug: this.#options.debug || false,
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
        this.#logger.log('error %o', e);
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
    const debug = options?.debug || false;
    const internalOptions: InternalPresenceOptions = {
      ...options,
      id,
      url,
      reliable,
      debug,
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
