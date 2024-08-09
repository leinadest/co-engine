'use client';

import { createApolloClient } from '@/config/apolloClient';
import { ApolloProvider } from '@apollo/client';
import { ReactNode } from 'react';

export default function ClientSideApolloProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ApolloProvider client={createApolloClient()}>{children}</ApolloProvider>
  );
}
