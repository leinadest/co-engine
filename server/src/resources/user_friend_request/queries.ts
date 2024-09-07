import gql from 'graphql-tag';
import * as yup from 'yup';
import { GraphQLError } from 'graphql';

import { type Context } from '../../config/apolloServer';

const typeDefs = gql`
  extend type Query {
    """
    Returns the friend requests of the authenticated user.
    """
    userFriendRequests(
      search: String
      type: String
      after: String
      first: Int
      orderBy: String
      orderDirection: String
    ): UserFriendRequestConnection!
  }
`;

interface UserFriendRequestsInput {
  search?: string;
  type?: string;
  after?: string;
  first?: number;
  orderBy?: string;
  orderDirection?: string;
}

const userFriendRequestInputSchema = yup.object().shape({
  search: yup.string().trim(),
  type: yup
    .string()
    .trim()
    .oneOf(['sent', 'received'], 'Type must be sent or received'),
  after: yup.string().trim(),
  first: yup
    .number()
    .integer('first must be an integer')
    .min(1, 'first must be greater than or equal to 1'),
  orderBy: yup
    .string()
    .trim()
    .oneOf(['username, created_at'], 'orderBy must be username or created_at'),
  orderDirection: yup
    .string()
    .trim()
    .oneOf(['ASC', 'DESC'], 'orderDirection must be ASC or DESC'),
});

const resolvers = {
  Query: {
    userFriendRequests: async (
      _: any,
      args: UserFriendRequestsInput,
      { authService, dataSources }: Context
    ) => {
      await userFriendRequestInputSchema.validate(args);

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.friendRequestsDB.getFriendRequests(args);
    },
  },
};

export default { typeDefs, resolvers };
