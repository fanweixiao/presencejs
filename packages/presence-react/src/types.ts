import { IPresence } from '@yomo/presence';
import React from 'react';

export type PresenceContextValue<R = any> = {
  [key in string]: R;
};

export interface ChannelProviderProps {
  id: string;
  initialState?: any;
  children: React.ReactNode;
}

export interface CreateChannelContext {
  (presence: Promise<IPresence>): {
    ChannelProvider: React.FC<ChannelProviderProps>;
    Suspense: React.FC<any>;
    usePeers: () => any[];
    useMyState: () => any;
    useUpdateMyState: Function;
  };
}
