import '../styles/globals.less';
import React, { useMemo } from 'react';

import 'dayjs/locale';

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
  from,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import {
  SearchConfigProvider,
} from '@monoid-dev/use-search';
import { url } from 'app/../.next-urls';
import Head from 'next/head';
import { useRouter as useNextRouter } from 'next/router';

import { AuthProvider, useAuth } from '../hooks/useAuth';

const endpoint = `${process.env.NEXT_PUBLIC_SERVER}/api/graphql`;

const WithApollo: React.FC = ({ children }) => {
  const client = useMemo(() => new ApolloClient({
    uri: endpoint,
    cache: new InMemoryCache(),
  }), []);
  const router = useNextRouter();

  const auth = useAuth();

  const createLink = () => {
    return from([
      onError(({ graphQLErrors }) => {
        if (graphQLErrors?.some((e) => e.message === 'Not authorized')) {
          router.push(url('/auth/login'));
        }
      }),
      createHttpLink({
        uri: endpoint,
        headers: auth.state.token ? {
          Authorization: `Bearer ${auth.state.token}`,
        } : {},
      }),
    ]);
  };

  useMemo(() => {
    client.setLink(createLink());

    if (!auth.state.token) {
      client.clearStore();
    }
  }, [auth.state.token]);

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  );
};

const useRouter = () => {
  const router = useNextRouter();

  return {
    get pathname() {
      return router.asPath.split('?')[0] ?? '';
    },
    get search() {
      return router.asPath.split('?')[1] ?? '';
    },
    navigate(link: string) {
      router.push(link);
    },
  };
};

function MyApp({ Component, pageProps }: any) {
  const initialToken = useMemo(
    () => (
      typeof window !== 'undefined'
        ? localStorage.getItem('uptimeMonitorToken')
        : null
    ),
    [],
  );

  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <title>
          Uptime Monitor
        </title>
      </Head>
      <SearchConfigProvider
        config={{
          useRouter,
        }}
      >
        <AuthProvider initialToken={initialToken}>
          <WithApollo>
            <Component {...pageProps} />
          </WithApollo>
        </AuthProvider>
      </SearchConfigProvider>
    </>
  );
}

export default MyApp;
