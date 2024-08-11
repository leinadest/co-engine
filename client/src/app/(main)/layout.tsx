import CollabSideBar from '@/features/collabs/components/CollabSidebar';
import ClientSideApolloProvider from '../_providers/apolloProvider';
import Sidebar from '@/components/common/Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientSideApolloProvider>
      <div className="grid grid-cols-[80px_320px_1fr] grid-rows-[100%] h-screen">
        <CollabSideBar />
        <Sidebar />
        {children}
      </div>
    </ClientSideApolloProvider>
  );
}
