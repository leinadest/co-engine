import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import * as yup from 'yup';

import { type Context } from '../../config/apolloServer';
import { User, type Chat } from '..';

const typeDefs = gql`
  input ChatsInput {
    search: String
    orderBy: String
    orderDirection: String
    after: String
    first: Int
  }

  extend type Query {
    """
    Returns all chats that the authenticated user is in.
    """
    chats(query: ChatsInput): ChatConnection!

    """
    Returns a single chat.
    """
    chat(id: ID!): Chat

    """
    Returns the authenticated user's direct chat with the specified user id.
    Creates one if not found.
    """
    directChat(userId: ID!): Chat
  }
`;

export interface ChatsInput {
  search?: string;
  orderBy?: string;
  orderDirection?: string;
  after?: string;
  first?: number;
}

const chatsInputSchema = yup
  .object()
  .optional()
  .shape({
    search: yup.string().trim(),
    orderBy: yup
      .string()
      .trim()
      .oneOf(
        ['last_message_at', 'name', 'created_at'],
        'orderBy must be last_message_at, name, or created_at'
      ),
    orderDirection: yup
      .string()
      .oneOf(['ASC', 'DESC'], 'orderDirection must be ASC or DESC'),
    after: yup.string(),
    first: yup.number().min(1, 'first must be greater than or equal to 1'),
  });

const resolvers = {
  Query: {
    chats: async (
      _: any,
      { query }: { query: ChatsInput },
      { authService, dataSources }: Context
    ) => {
      await chatsInputSchema.validate(query);

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.chatsDB.getChats(query ?? {});
    },
    chat: async (
      _: any,
      { id }: { id: string },
      { authService, dataSources }: Context
    ): Promise<Chat | null> => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.chatsDB.getChat(id);
    },
    directChat: async (
      _: any,
      { userId }: { userId: string },
      { authService, dataSources }: Context
    ): Promise<Chat | null> => {
      const [user, otherUser] = await Promise.all([
        authService.getUser(),
        User.findByPk(userId),
      ]);

      if (user === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (otherUser === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return await dataSources.chatsDB.getOrCreateDirectChat(user, otherUser);
    },
  },
};

export default { typeDefs, resolvers };
