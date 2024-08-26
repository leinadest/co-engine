import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import * as yup from 'yup';

import { User } from '../';
import type AuthService from '../../services/authService';
import { type Context } from '../../config/apolloServer';

const typeDefs = gql`
  extend type Query {
    """
    Returns the authenticated user.
    """
    me: User

    """
    Returns all users.
    """
    users(
      search: String
      orderDirection: String
      orderBy: String
      after: String
      first: Int
    ): PublicUserConnection!

    """
    Returns the user with the specified ID or username and discriminator.
    """
    user(id: ID, username: String, discriminator: String): PublicUser!

    """
    Returns the friends of the authenticated user.
    """
    friends(
      after: String
      first: Int
      status: String
      search: String
      orderDirection: String
      orderBy: String
    ): PublicUserConnection!
  }
`;

interface UsersInput {
  search?: string;
  orderDirection?: string;
  orderBy?: string;
  after?: string;
  first?: number;
}

interface UserInput {
  id?: string;
  username?: string;
  discriminator?: string;
}

interface FriendsInput extends UsersInput {
  status: 'online' | 'offline';
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

const userInputSchema = yup.object().shape({
  id: yup.string(),
  username: yup
    .string()
    .when('id', (id) =>
      id === undefined
        ? yup
            .string()
            .required('Either id or username and discriminator is required')
        : yup.string()
    ),
  discriminator: yup
    .string()
    .when('id', (id) =>
      id === undefined
        ? yup
            .string()
            .required('Either id or username and discriminator is required')
        : yup.string()
    ),
});

const friendsInputSchema = usersInputSchema.shape({
  status: yup
    .string()
    .oneOf(['online', 'offline'], 'status must be either online or offline'),
});

const resolvers = {
  Query: {
    users: async (_: any, args: UsersInput, { dataSources }: Context) => {
      await usersInputSchema.validate(args);
      return await dataSources.usersDB.getUsers(args);
    },
    user: async (_: any, { id, username, discriminator }: UserInput) => {
      await userInputSchema.validate({ id, username, discriminator });

      let user;
      if (id !== undefined) {
        user = await User.findByPk(id);
      }
      if (id === undefined) {
        user = await User.findOne({ where: { username, discriminator } });
      }

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
      args: FriendsInput,
      { authService, dataSources }: Context
    ) => {
      await friendsInputSchema.validate(args);

      const userId = authService.getUserId();
      if (userId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.usersDB.getFriends(args);
    },
  },
};

export default { typeDefs, resolvers };
