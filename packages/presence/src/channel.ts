import {
  ChannelEventSubscribeCallbackFn,
  PayloadPacket,
  IChannel,
  State,
  IPeers,
  PeersSubscribeCallbackFn,
  Signaling,
} from './type';
import { encode as msgPackEncode, decode } from '@msgpack/msgpack';
import { Logger } from './logger';

const signalingEncode = (data: Signaling) => msgPackEncode(data);

export class Channel implements IChannel {
  #transport: any;
  #state: State;
  #subscribers = new Map<string, ChannelEventSubscribeCallbackFn<any>>();
  #members: State[] = [];
  #peers: Peers | null = null;
  #joinTimestamp: number;
  #writer: any;
  #reliable: boolean;
  #logger: Logger;
  id: string;
  constructor(
    id: string,
    state: State,
    transport: any,
    options: {
      reliable: boolean;
      debug: boolean;
    }
  ) {
    this.id = id;
    this.#state = state;
    this.#transport = transport;
    this.#logger = new Logger({
      enabled: options.debug,
      module: 'Presence Channel',
    });
    this.#joinTimestamp = Date.now();
    this.#joinTimestamp;
    this.#reliable = options.reliable;
    this.#read();
    this.#joinChannel();
    this.#addLeaveListener();
  }
  #addLeaveListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.leave();
      });
    }
  }
  broadcast<T>(eventName: string, payload: T): void {
    this.#broadcast(
      eventName,
      this.#getDataPacket({
        state: {
          id: this.#state.id,
        },
        payload,
      })
    );
  }
  subscribe<T>(
    eventName: string,
    callbackFn: ChannelEventSubscribeCallbackFn<T>
  ) {
    this.#subscribers.set(eventName, callbackFn);
    // unsubscribe
    return () => {
      this.#subscribers.delete(eventName);
    };
  }
  subscribePeers(callbackFn: PeersSubscribeCallbackFn) {
    if (!this.#peers) {
      this.#peers = new Peers(this.#transport);
    }
    return this.#peers.subscribe(callbackFn);
  }
  leave() {
    this.#write(
      signalingEncode({
        t: 'control',
        op: 'peer_offline',
        c: this.id,
      })
    );
    // this.#transport.close();
  }
  // #updateMetadata(metadata: State) {
  //   this.#state = metadata;
  //   this.#write(
  //     signalingEncode({
  //       t: 'control',
  //       op: 'peer_state',
  //       c: this.id,
  //       p: this.#state.id,
  //       pl: msgPackEncode(this.#state),
  //     })
  //   );
  // }
  #joinChannel() {
    this.#write(
      signalingEncode({
        t: 'control',
        op: 'channel_join',
        c: this.id,
        pl: msgPackEncode(this.#state),
      })
    );
  }
  #getDataPacket<T>(payload: T) {
    return {
      state: this.#state,
      payload,
    };
  }
  #broadcast<T>(eventName: string, dataPacket: PayloadPacket<T>) {
    this.#write(
      signalingEncode({
        t: 'data',
        c: this.id,
        pl: msgPackEncode({
          event: eventName,
          ...dataPacket.payload,
        }),
      })
    );
  }
  async #write(data: Uint8Array) {
    if (!this.#writer) {
      if (this.#transport.datagrams.writable.locked) {
        return;
      }
      if (this.#reliable) {
        this.#writer = this.#transport.createSendStream().getWriter();
      }
      this.#writer = this.#transport.datagrams.writable.getWriter();
    }
    await this.#writer.ready;
    this.#writer.write(data);
    // writer.close();
  }
  async #read() {
    try {
      let reader;
      if (this.#reliable) {
        reader = this.#transport.receiveStreams.readable.getReader();
      } else {
        reader = this.#transport.datagrams.readable.getReader();
      }
      while (true) {
        const { value } = await reader.read();
        const data = new Uint8Array(value);
        const signaling: Signaling = decode(data) as Signaling;
        if (signaling.t === 'control') {
          this.#logger.log(
            'control ',
            `op: ${signaling.op}\n`,
            `p: ${signaling.p}\n`,
            'pl: ',
            signaling.pl
          );
          if (signaling.op === 'channel_join') {
            this.#online();
            this.#syncState();
            continue;
          }
          if (signaling.op === 'peer_online') {
            this.#handleOnline(signaling.p!);
            continue;
          }
          if (signaling.op === 'peer_offline') {
            this.#offline(signaling.p!);
            continue;
          }

          if (signaling.op === 'peer_state') {
            this.#handleSync({
              id: signaling.p,
              ...(decode(signaling.pl!) as any),
            });
            continue;
          }
        } else if (signaling.t === 'data') {
          const { event, ...payload } = decode(signaling.pl!) as any;
          if (this.#subscribers.has(event)) {
            this.#subscribers.get(event)!(payload, { id: signaling.p! });
          }
        }
      }
    } catch (e) {
      this.#logger.log('read error: ', e);
      return;
    }
  }
  #handleOnline(id: string) {
    if (id !== this.#state.id) {
      const idx = this.#members.findIndex((member) => member.id === id);
      if (idx > -1) {
        this.#members[idx] = { id };
      } else {
        this.#members.push({ id });
      }
      this.#syncState();
      this.#peers?.trigger(this.#members);
    }
  }
  #handleSync(payload: any) {
    if (payload.id !== this.#state.id) {
      const idx = this.#members.findIndex((member) => {
        return String(member.id) === String(payload.id);
      });

      if (idx > -1) {
        this.#members[idx] = payload;
      } else {
        this.#members.push(payload);
      }
      this.#peers?.trigger(this.#members);
    }
  }
  #online() {
    this.#logger.log(`online cid: ${this.id} state: `, this.#state);
    this.#write(
      signalingEncode({
        t: 'control',
        op: 'peer_online',
        c: this.id,
        p: this.#state.id,
      })
    );
  }
  #syncState() {
    this.#logger.log('sync state: ', this.#state);
    this.#write(
      signalingEncode({
        t: 'control',
        op: 'peer_state',
        c: this.id,
        p: this.#state.id,
        pl: msgPackEncode(this.#state),
      })
    );
  }
  #offline(id: string) {
    this.#logger.log(`offline id: ${id}`);
    if (id !== this.#state.id) {
      const idx = this.#members.findIndex((member) => {
        return member.id === id;
      });

      if (idx > -1) {
        this.#members.splice(idx, 1);
      }

      this.#peers?.trigger(this.#members);
    }
  }
}

class Peers implements IPeers {
  #transport: any = null;
  #callbackFns: PeersSubscribeCallbackFn[] = [];
  constructor(transport: any) {
    this.#transport = transport;
    this.#transport;
  }
  subscribe(callbackFn: PeersSubscribeCallbackFn) {
    this.#callbackFns.push(callbackFn);
    return () => {
      const fnIndex = this.#callbackFns.findIndex((fn) => fn === callbackFn);
      if (fnIndex > -1) {
        this.#callbackFns.splice(fnIndex, 1);
      }
    };
  }
  trigger(members: State[]) {
    this.#callbackFns.forEach((callbackFn) => {
      callbackFn(members);
    });
  }
}
