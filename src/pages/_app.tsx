import 'antd/dist/antd.less';
import '../styles/globals.css';
import { useMemo } from 'react';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';
import Head from 'next/head';

function MyApp({ Component, pageProps }: any) {
  const client = useMemo(() => new ApolloClient({
    uri: `${process.env.NEXT_PUBLIC_SERVER}/api/graphql`,
    cache: new InMemoryCache(),
  }), []);

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </>
  );
}

export default MyApp;
