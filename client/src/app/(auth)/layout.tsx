import ClientApolloProvider from '../(main)/_providers/ClientApolloProvider';
import Header from '@/app/_components/Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ClientApolloProvider>
      <Header />
      {children}
    </ClientApolloProvider>
  );
}
