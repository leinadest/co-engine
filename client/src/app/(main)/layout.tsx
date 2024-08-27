'use client';

import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import ClientSideApolloProvider from '../_providers/apolloProvider';
import Sidebar from '@/app/(main)/Sidebar';
import ThemeProvider from '../_providers/themeProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientSideApolloProvider>
      <ThemeProvider>
        <div className="grid grid-cols-[80px_320px_minmax(0,1fr)] grid-rows-[100%] h-screen">
          <CollabSideBar />
          <Sidebar />
          {children}
        </div>
      </ThemeProvider>
    </ClientSideApolloProvider>
  );
}
