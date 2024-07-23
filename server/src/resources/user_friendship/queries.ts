import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { Op } from 'sequelize';

import type AuthService from '../../services/authService';
import { UserFriendship } from '../';

export const typeDefs = gql`
  extend type Query {
    """
    Returns the friends of the authenticated user.
    """
    userFriendships: [UserFriendship!]
  }
`;

export const resolvers = {
  Query: {
    userFriendships: async (
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

      const friendships = await UserFriendship.findAll({
        where: { [Op.or]: [{ sender_id: userId }, { receiver_id: userId }] },
      });

      return friendships;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
