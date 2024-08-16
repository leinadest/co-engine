import ClientSideApolloProvider from '../_providers/apolloProvider';
import Header from '@/components/common/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientSideApolloProvider>
      <Header />
      {children}
    </ClientSideApolloProvider>
  );
}