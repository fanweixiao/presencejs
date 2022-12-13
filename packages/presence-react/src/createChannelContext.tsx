import { IPresence, IChannel } from '@yomo/presence';
import React, { useState, createContext, useEffect, useContext } from 'react';
import {
  ChannelProviderProps,
  CreateChannelContext,
  PresenceContextValue,
} from './types';

export const ChannelContext = createContext<PresenceContextValue>(null as any);

const createChannelContext: CreateChannelContext = function (
  presence: Promise<IPresence>
) {
  let channel: IChannel | null = null;

  function ChannelProvider({
    id,
    initialState,
    children,
  }: ChannelProviderProps) {
    useEffect(() => {
      presence.then((p) => {
        channel = p.joinChannel(id, initialState);
        channel.subscribePeers((peers) => {
          console.log('subscribe peers:', peers);

          setPeers([...peers]);
        });
      });
    }, []);
    const [peers, setPeers] = useState<any[]>([]);
    const [myState, setMyState] = useState(initialState);

    return (
      <ChannelContext.Provider
        value={{
          peers,
          myState,
          setMyState,
        }}
      >
        {children}
      </ChannelContext.Provider>
    );
  }

  function usePeers() {
    const value = useContext(ChannelContext);
    if (value === undefined) {
      throw new Error('usePeers must be used within a ChannelProvider');
    }
    return value.peers;
  }

  function useUpdateMyState() {
    const value = useContext(ChannelContext);
    if (value === undefined) {
      throw new Error('useUpdateMyState must be used within a ChannelProvider');
    }
    return (state: any) => {
      channel?.updateMetadata(state);
      value.setMyState(state);
    };
  }

  function useMyState() {
    const value = useContext(ChannelContext);
    if (value === undefined) {
      throw new Error('usePeers must be used within a ChannelProvider');
    }
    return value.myState;
  }

  return {
    ChannelProvider,
    // TODO:
    Suspense: () => null,
    usePeers,
    useMyState,
    useUpdateMyState,
  };
};

export default createChannelContext;
