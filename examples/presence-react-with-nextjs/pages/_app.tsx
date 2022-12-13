import '../../../packages/webtransport-polyfill/dist/index';
import type { AppProps } from 'next/app';
import { ChannelProvider, id } from '../lib/presence.config';
import Suspense from '../lib/suspense';

function MyApp(props: AppProps) {
  const { Component, pageProps } = props;
  return (
    <Suspense fallback={<div>123</div>}>
      <ChannelProvider id="test-channel" initialState={{ id, name: '' }}>
        <Component {...pageProps} />
      </ChannelProvider>
    </Suspense>
  );
}

export default MyApp;
