import ClientSideApolloProvider from '../_providers/apolloProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <ClientSideApolloProvider>{children}</ClientSideApolloProvider>;
}
