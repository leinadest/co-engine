import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  gql,
} from '@apollo/client';
import {
  offsetLimitPagination,
  relayStylePagination,
} from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

import authStorage from '../features/auth/stores/authStorage';

export const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        blocked: relayStylePagination(),
        chats: relayStylePagination(),
        friends: relayStylePagination(),
        messages: relayStylePagination(),
        userFriendRequests: { ...offsetLimitPagination(), keyArgs: ['type'] },
        users: relayStylePagination(),
      },
    },
  },
});

export function createApolloClient() {
  const authLink = setContext(async (_, { headers }) => {
    try {
      const accessToken = authStorage.getAccessToken();
      const authorization = accessToken !== null ? `Bearer ${accessToken}` : '';
      return { headers: { ...headers, authorization } };
    } catch (e) {
      console.log(e);
      return { headers };
    }
  });

  const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  });

  return new ApolloClient({
    link: ApolloLink.from([authLink, httpLink]),
    cache,
  });
}
export async function waitForServer(retryInterval = 5000, maxRetries = 12) {
  const client = createApolloClient();
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const res = await client.query({
        query: gql`
          {
            root
          }
        `,
      });
      console.log('Query result:', res);
      console.log('Server is up and running');
      return client;
    } catch (error) {
      console.error('Server not ready, retrying...', error);
      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      attempts++;
    }
  }

  throw new Error('Server is not ready after maximum retries');
}
