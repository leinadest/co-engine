import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';

import type AuthService from '../../services/authService';
import UserFriendship from './model';

export const typeDefs = gql`
  extend type Query {
    """
    Returns the friends of the authenticated user.
    """
    userFriendships(type: String): [UserFriendship!]
  }
`;

export const resolvers = {
  Query: {
    userFriendships: async (
      _: any,
      { type }: { type: 'received' | 'sent' },
      { authService }: { authService: AuthService }
    ) => {
      const userId = authService.getUserId();
      if (userId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (type !== 'received' && type !== 'sent') {
        type = 'received';
      }

      const result =
        type === 'received'
          ? await UserFriendship.findAll({ where: { receiver_id: userId } })
          : await UserFriendship.findAll({
              where: { sender_id: userId },
            });

      return result;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
