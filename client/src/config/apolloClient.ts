import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  createHttpLink,
  gql,
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import {
  offsetLimitPagination,
  relayStylePagination,
} from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';

import authStorage from '../features/auth/stores/authStorage';

const errorLink = onError(({ networkError, graphQLErrors }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`GraphQL Error: ${message}`)
    );
  }
  if (networkError) {
    console.log(`Network Error: ${networkError}`);
  }
});

const authLink = setContext(async (_, { headers }) => {
  try {
    const accessToken = await authStorage.getAccessToken();
    return {
      headers: {
        ...headers,
        authorization: accessToken !== null ? `Bearer ${accessToken}` : '',
      },
    };
  } catch (e) {
    console.log(e);
    return { headers };
  }
});

const httpLink = createHttpLink({
  uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
});

export function createApolloClient() {
  const link = ApolloLink.from([errorLink, authLink, httpLink]);

  const cache = new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          blocked: relayStylePagination(),
          chats: relayStylePagination(),
          friends: relayStylePagination(),
          messages: relayStylePagination(),
          userFriendRequests: offsetLimitPagination(),
          users: relayStylePagination(),
        },
      },
    },
  });

  return new ApolloClient({ link, cache });
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
