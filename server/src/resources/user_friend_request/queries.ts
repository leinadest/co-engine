import gql from 'graphql-tag';
import * as yup from 'yup';
import { GraphQLError } from 'graphql';

import { type Context } from '../../config/apolloServer';

const typeDefs = gql`
  input UserFriendRequestsInput {
    type: String
    orderBy: String
    orderDirection: String
    limit: Int
    offset: Int
  }

  extend type Query {
    """
    Returns the friend requests of the authenticated user.
    """
    userFriendRequests(query: UserFriendRequestsInput): UserFriendRequests
  }
`;

interface UserFriendRequestsInput {
  type?: string;
  orderBy?: string;
  orderDirection?: string;
  limit?: number;
  offset?: number;
}

const userFriendRequestInputSchema = yup.object().shape({
  type: yup
    .string()
    .trim()
    .oneOf(['sent', 'received'], 'Type must be sent or received'),
  orderBy: yup
    .string()
    .trim()
    .oneOf(['username, created_at'], 'orderBy must be username or created_at'),
  orderDirection: yup
    .string()
    .trim()
    .oneOf(['ASC', 'DESC'], 'orderDirection must be ASC or DESC'),
  limit: yup
    .number()
    .integer('limit must be an integer')
    .min(1, 'limit must be greater than or equal to 1'),
  offset: yup
    .number()
    .integer('offset must be an integer')
    .min(1, 'offset must be greater than or equal to 1'),
});

const resolvers = {
  Query: {
    userFriendRequests: async (
      _: any,
      { query }: { query: UserFriendRequestsInput },
      { authService, dataSources }: Context
    ) => {
      await userFriendRequestInputSchema.validate(query);

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.friendRequestsDB.getFriendRequests(query ?? {});
    },
  },
};

export default { typeDefs, resolvers };
