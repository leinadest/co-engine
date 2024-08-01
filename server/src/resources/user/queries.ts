import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import * as yup from 'yup';

import { User } from '../';
import type AuthService from '../../services/authService';
import { type Context } from '../../config/apolloServer';

const typeDefs = gql`
  input UsersInput {
    search: String
    orderDirection: String
    orderBy: String
    after: String
    first: Int
  }

  extend type Query {
    """
    Returns the authenticated user.
    """
    me: User

    """
    Returns all users.
    """
    users(query: UsersInput): PublicUserConnection!

    """
    Returns the user with the specified ID.
    """
    user(id: ID!): PublicUser!

    """
    Returns the friends of the authenticated user.
    """
    friends(query: UsersInput): PublicUserConnection!

    """
    Returns the users blocked by the authenticated user.
    """
    blocked(query: UsersInput): PublicUserConnection!
  }
`;

interface UsersInput {
  search?: string;
  orderDirection?: string;
  orderBy?: string;
  after?: string;
  first?: number;
}

const usersInputSchema = yup
  .object()
  .optional()
  .shape({
    search: yup.string().trim(),
    orderDirection: yup
      .string()
      .trim()
      .oneOf(['ASC', 'DESC'], 'Order direction must be ASC or DESC'),
    orderBy: yup
      .string()
      .trim()
      .oneOf(
        ['username', 'created_at'],
        'Order by must be username or created_at'
      ),
    after: yup.string().trim(),
    first: yup
      .number()
      .integer('First must be an integer')
      .min(1, 'First must be at least 1'),
  });

const friendsInputSchema = usersInputSchema.shape({
  status: yup
    .string()
    .trim()
    .oneOf(['pending', 'accepted'], 'Status must be pending or accepted'),
});

const resolvers = {
  Query: {
    users: async (
      _: any,
      args: { query: UsersInput },
      { dataSources }: Context
    ) => {
      await usersInputSchema.validate(args.query);
      const users = await dataSources.usersDB.getUsers(args.query ?? {});
      return users;
    },
    user: async (_: any, { id }: { id: string }) => {
      const user = await User.findByPk(id);
      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return user;
    },
    me: async (
      _: any,
      __: any,
      { authService }: { authService: AuthService }
    ) => {
      const userId = authService.getUserId();
      if (userId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return await User.findByPk(userId);
    },
    friends: async (
      _: any,
      { query }: { query: UsersInput },
      { authService, dataSources }: Context
    ) => {
      await friendsInputSchema.validate(query);

      const userId = authService.getUserId();
      if (userId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.usersDB.getFriends(query ?? {});
    },
    blocked: async (
      _: any,
      { query }: { query: UsersInput },
      { authService, dataSources }: Context
    ) => {
      await usersInputSchema.validate(query);

      const userId = authService.getUserId();
      if (userId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.usersDB.getBlocked(query ?? {});
    },
  },
};

export default { typeDefs, resolvers };
