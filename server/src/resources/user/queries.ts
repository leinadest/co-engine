import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { User } from '../';
import type AuthService from '../../services/authService';

export const typeDefs = gql`
  extend type Query {
    """
    Returns the authenticated user.
    """
    me: User

    """
    Returns all users.
    """
    users: [AllUsers!]

    """
    Returns the user with the specified ID.
    """
    user(id: ID!): User
  }
`;

export const resolvers = {
  Query: {
    me: async (
      _parent: any,
      _args: any,
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
    users: async () => {
      const users = await User.findAll({
        where: {},
        attributes: ['id', 'username', 'discriminator'],
      });
      return users;
    },
    user: async (_parent: any, { id }: { id: string }) => {
      return await User.findByPk(id);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
