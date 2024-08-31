'use client';

import ClientApolloProvider from '../_providers/ClientApolloProvider';
import ThemeProvider from '../_providers/ThemeProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientApolloProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </ClientApolloProvider>
  );
}
