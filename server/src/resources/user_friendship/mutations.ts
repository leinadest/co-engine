import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';

import type AuthService from '../../services/authService';
import { UserFriendship } from '..';
import { Op } from 'sequelize';

export const typeDefs = gql`
  extend type Mutation {
    """
    Deletes a friendship with the specified user.
    """
    deleteFriendship(friendId: ID!): Boolean
  }
`;

export const resolvers = {
  Mutation: {
    deleteFriendship: async (
      _parent: any,
      { friendId }: { friendId: string },
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (authService.getUserId() === friendId) {
        throw new GraphQLError('Cannot delete friendship with yourself', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const result = await UserFriendship.destroy({
        where: {
          [Op.or]: [
            {
              user_id: authService.getUserId(),
              friend_id: friendId,
            },
            {
              user_id: friendId,
              friend_id: authService.getUserId(),
            },
          ],
        },
      });
      if (result === 0) {
        throw new GraphQLError('Friendship not found', {
          extensions: { code: 'FRIENDSHIP_NOT_FOUND' },
        });
      }

      return true;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
