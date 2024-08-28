import ClientSideApolloProvider from '../_providers/apolloProvider';
import Header from '@/app/_components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientSideApolloProvider>
      <Header />
      {children}
    </ClientSideApolloProvider>
  );
}
