'use client';

import ClientSideApolloProvider from '../_providers/apolloProvider';
import ThemeProvider from '../_providers/themeProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientSideApolloProvider>
      <ThemeProvider>
        <div className="dark">{children}</div>
      </ThemeProvider>
    </ClientSideApolloProvider>
  );
}
