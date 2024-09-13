import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import * as yup from 'yup';

import { type Context } from '../../config/apolloServer';
import { Chat, ChatUser } from '..';

const typeDefs = gql`
  extend type Query {
    """
    Returns all chats that the authenticated user is in.
    """
    chats(
      after: String
      first: Int
      search: String
      orderBy: String
      orderDirection: String
    ): ChatConnection!

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
      args: ChatsInput,
      { authService, dataSources }: Context
    ) => {
      await chatsInputSchema.validate(args);

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.chatsDB.getChats(args);
    },
    chat: async (
      _: any,
      { id }: { id: string },
      { authService }: Context
    ): Promise<Chat | null> => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const chatUserRelation = await ChatUser.findOne<
        ChatUser & Record<string, any>
      >({
        include: { model: Chat },
        where: { chat_id: id, user_id: authService.getUserId() },
      });

      if (chatUserRelation === null) {
        throw new GraphQLError('User is not in the chat', {
          extensions: { code: 'FORBIDDEN' },
        });
      }

      return chatUserRelation.chat.toJSON();
    },
    directChat: async (
      _: any,
      { userId }: { userId: string },
      { authService, dataSources }: Context
    ): Promise<Chat | null> => {
      const authUserId = authService.getUserId();

      if (authUserId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      return await dataSources.chatsDB.getOrCreateDirectChat(
        authUserId,
        userId
      );
    },
  },
};

export default { typeDefs, resolvers };
