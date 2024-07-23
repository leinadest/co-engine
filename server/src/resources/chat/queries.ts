import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';

import type AuthService from '../../services/authService';
import { Chat, User } from '../';

export const typeDefs = gql`
  extend type Query {
    """
    Returns all chats that the authenticated user is in.
    """
    chats: [Chat!]
  }
`;

export const resolvers = {
  Query: {
    chats: async (
      _: any,
      __: any,
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const chats = await Chat.findAll({
        include: [
          {
            model: User,
            where: { id: authService.getUserId() },
          },
        ],
      });
      return chats;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
