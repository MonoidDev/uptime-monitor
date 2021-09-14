import '../styles/globals.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from '@apollo/client';
import { useMemo } from 'react';

function MyApp({ Component, pageProps }: any) {
  const client = useMemo(() => new ApolloClient({
    uri: `${process.env.NEXT_PUBLIC_SERVER}/api/graphql`,
    cache: new InMemoryCache(),
  }), []);

  return (
    <ApolloProvider client={client}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}

export default MyApp
