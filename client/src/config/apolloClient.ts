import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  split,
} from '@apollo/client';
import {
  offsetLimitPagination,
  relayStylePagination,
} from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';

import authStorage from '../features/auth/stores/authStorage';

export function createApolloClient() {
  const authLink = setContext(async (_, { headers }) => {
    try {
      const accessToken = authStorage.getAccessToken();
      const authorization = accessToken ? `Bearer ${accessToken}` : '';
      return { headers: { ...headers, authorization } };
    } catch (e) {
      return { headers };
    }
  });

  const httpLink = createHttpLink({
    uri: `${process.env.NEXT_PUBLIC_API_URL}/graphql`,
  });

  const wsLink = new GraphQLWsLink(
    createClient({
      url: `${process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws')}/graphql`,
      connectionParams: { authToken: authStorage.getAccessToken() },
    })
  );

  const splitLink = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      const useWsLink =
        definition.kind === 'OperationDefinition' &&
        definition.operation === 'subscription';
      return useWsLink;
    },
    wsLink,
    httpLink
  );

  const cache = new InMemoryCache({
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

  return new ApolloClient({ link: authLink.concat(splitLink), cache });
}
