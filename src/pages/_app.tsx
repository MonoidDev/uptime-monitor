import 'antd/dist/antd.less';
import '../styles/globals.css';
import React, { useMemo } from 'react';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import Head from 'next/head';

import { AuthProvider, useAuth } from '../hooks/useAuth';

const endpoint = `${process.env.NEXT_PUBLIC_SERVER}/api/graphql`;

const WithApollo: React.FC = ({ children }) => {
  const client = useMemo(() => new ApolloClient({
    uri: endpoint,
    cache: new InMemoryCache(),
  }), []);

  const auth = useAuth();

  useMemo(() => {
    client.setLink(createHttpLink({
      uri: endpoint,
      headers: auth.state.token ? {
        Authentication: `Bearer ${auth.state.token}`,
      } : {},
    }));
  }, [auth.state.token]);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

function MyApp({ Component, pageProps }: any) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <AuthProvider>
        <WithApollo>
          <Component {...pageProps} />
        </WithApollo>
      </AuthProvider>
    </>
  );
}

export default MyApp;
