declare global {
  interface Window {
    WebTransport: any;
  }
}

export type State = {
  id: string;
  [key: string]: any;
};

export type PayloadPacket<T> = {
  state: State;
  payload?: T;
};

// external options, api caller should use this options
export type PresenceOptions = {
  url?: string;
  id?: string;
  publicKey?: string;
  appId?: string;
  appSecret?: string;
  endpoint?: string;
  reliable?: boolean; // default: false
  debug?: boolean;// default: false
};

// internal options, create presence instance with this options
export type InternalPresenceOptions = {
  url: string;
  id: string;
  reliable: boolean;
  publicKey?: string;
  appId?: string;
  appSecret?: string;
  endpoint?: string;
  debug?: boolean;
};

// presence instance
export interface IPresence {
  onReady(callbackFn: (presence: IPresence) => void): void;
  joinChannel: (channelId: string, metadata?: State) => IChannel;
  leaveChannel: (channelId: string) => void;
}

type Peers = State[];

export type PeersSubscribeCallbackFn = (peers: Peers) => any;
export type PeersUnsubscribe = Function;
export type Unsubscribe = Function;
export type PeersSubscribe = (
  callbackFn: PeersSubscribeCallbackFn
) => PeersUnsubscribe;
export type IPeers = { subscribe: PeersSubscribe };

export type ChannelEventSubscribeCallbackFn<T> = (
  payload: T,
  state: State
) => any;

export interface IChannel {
  id: string;
  broadcast<T>(eventName: string, payload: T): void;
  subscribe<T>(
    eventName: string,
    callbackFn: ChannelEventSubscribeCallbackFn<T>
  ): Unsubscribe;
  subscribePeers: PeersSubscribe;
  leave(): void;
}

export interface Signaling {
  t: 'control' | 'data';
  op?: 'channel_join' | 'peer_online' | 'peer_state' | 'peer_offline';
  p?: string;
  c: string;
  pl?: ArrayBuffer;
}
