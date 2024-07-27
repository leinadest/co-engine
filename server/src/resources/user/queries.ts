import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { User } from '../';
import type AuthService from '../../services/authService';

const typeDefs = gql`
  extend type Query {
    """
    Returns the authenticated user.
    """
    me: User

    """
    Returns all users.
    """
    users: [PublicUser]!

    """
    Returns the user with the specified ID.
    """
    user(id: ID!): PublicUser!

    """
    Returns the friends of the authenticated user.
    """
    friends: [PublicUser]!

    """
    Returns the users blocked by the authenticated user.
    """
    blocked: [PublicUser]!
  }
`;

const resolvers = {
  Query: {
    users: async () => {
      const users = await User.findAll({
        where: {},
        attributes: { exclude: ['password_hash', 'email'] },
      });
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
      __: any,
      { authService }: { authService: AuthService }
    ) => {
      const userId = authService.getUserId();
      if (userId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const userWithFriends = (await User.findByPk(userId, {
        include: {
          model: User,
          as: 'friends',
          required: true,
          attributes: { exclude: ['password_hash', 'email'] },
        },
      })) as (User & { friends: User[] }) | null;

      const friends = userWithFriends === null ? [] : userWithFriends.friends;
      return friends;
    },
    blocked: async (
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

      const blockedUsers = (await User.findAll({
        include: {
          model: User,
          as: 'blockers',
          where: { id: userId },
          attributes: [],
        },
        attributes: { exclude: ['password_hash', 'email'] },
      })) as unknown as Array<Omit<User, 'password_hash' | 'email'>>;
      return blockedUsers;
    },
  },
};

export default { typeDefs, resolvers };
