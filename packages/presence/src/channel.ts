import {
  ChannelEventSubscribeCallbackFn,
  PayloadPacket,
  IChannel,
  Metadata,
  IPeers,
  PeersSubscribeCallbackFn,
  Signaling,
} from './type';
import { encode as msgPackEncode, decode } from '@msgpack/msgpack';

const signalingEncode = (data: Signaling) => msgPackEncode(data);

export class Channel implements IChannel {
  #transport: any;
  #metadata: Metadata;
  #subscribers = new Map<string, ChannelEventSubscribeCallbackFn<any>>();
  #members: Metadata[] = [];
  #peers: Peers | null = null;
  #joinTimestamp: number;
  #writer: any;
  id: string;
  constructor(id: string, metadata: Metadata, transport: any) {
    this.id = id;
    this.#metadata = metadata;
    this.#transport = transport;
    this.#joinTimestamp = Date.now();
    this.#joinTimestamp;
    this.#read();
    this.#joinChannel();
  }
  broadcast<T>(eventName: string, payload: T): void {
    this.#broadcast(eventName, this.#getDataPacket<T>(payload));
  }
  async subscribe<T>(
    eventName: string,
    callbackFn: ChannelEventSubscribeCallbackFn<T>
  ): Promise<void> {
    this.#subscribers.set(eventName, callbackFn);
  }
  subscribePeers(callbackFn: PeersSubscribeCallbackFn) {
    if (!this.#peers) {
      this.#peers = new Peers(this.#transport);
    }
    return this.#peers.subscribe(callbackFn);
  }
  leave() {
    this.#transport.close();
  }
  updateMetadata(metadata: Metadata) {
    this.#metadata = metadata;
    this.#write(
      signalingEncode({
        t: 'control',
        op: 'peer_state',
        c: this.id,
        p: this.#metadata.id,
        pl: msgPackEncode(this.#metadata),
      })
    );
  }
  #joinChannel() {
    this.#write(
      signalingEncode({
        t: 'control',
        op: 'channel_join',
        c: this.id,
        pl: msgPackEncode(this.#metadata),
      })
    );
  }
  #getDataPacket<T>(payload: T) {
    return {
      metadata: this.#metadata,
      payload,
    };
  }
  #broadcast<T>(eventName: string, dataPacket: PayloadPacket<T>) {
    const writer = this.#transport.datagrams.writable.getWriter();
    writer.write(
      signalingEncode({
        t: 'data',
        c: this.id,
        pl: msgPackEncode({
          event: eventName,
          ...dataPacket.payload,
        }),
      })
    );
    writer.close();
  }
  async #write(data: Uint8Array) {
    if (!this.#writer) {
      if (this.#transport.datagrams.writable.locked) {
        return
      }
      this.#writer = this.#transport.datagrams.writable.getWriter();
    }
    await this.#writer.ready;
    this.#writer.write(data);
    // writer.close();
  }
  async #read() {
    try {
      const reader = this.#transport.datagrams.readable.getReader();
      while (true) {
        const { value } = await reader.read();
        const data = new Uint8Array(value);
        const signaling: Signaling = decode(data) as Signaling;
        if (signaling.t === 'control') {
          console.log(signaling.op, signaling.p, signaling.pl);
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
      console.log(e);
      return;
    }
  }
  #handleOnline(id: string) {
    if (id !== this.#metadata.id) {
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
    if (payload.id !== this.#metadata.id) {
      const idx = this.#members.findIndex((member) => {
        console.log(
          String(member.id) === String(payload.id),
          member.id,
          payload.id
        );

        return String(member.id) === String(payload.id);
      });
      console.log('idx:', idx, this.#members, payload.id);

      if (idx > -1) {
        this.#members[idx] = payload;
      } else {
        this.#members.push(payload);
      }
      this.#peers?.trigger(this.#members);
    }
  }
  #online() {
    console.log('online');
    this.#write(
      signalingEncode({
        t: 'control',
        op: 'peer_online',
        c: this.id,
        p: this.#metadata.id,
      })
    );
  }
  #syncState() {
    this.#write(
      signalingEncode({
        t: 'control',
        op: 'peer_state',
        c: this.id,
        p: this.#metadata.id,
        pl: msgPackEncode(this.#metadata),
      })
    );
  }
  #offline(id: string) {
    if (id !== this.#metadata.id) {
      const idx = this.#members.findIndex((member) => {
        return member.id === id;
      });

      if (idx > -1) {
        this.#members.splice(idx, 1);
      }
      console.log(this.#members.length, 'ccc');

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
  trigger(members: Metadata[]) {
    this.#callbackFns.forEach((callbackFn) => {
      callbackFn(members);
    });
  }
}
