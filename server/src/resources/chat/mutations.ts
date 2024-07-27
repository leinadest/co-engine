import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import * as yup from 'yup';

import { type Context } from '../../config/apolloServer';
import { Chat, ChatUser, User } from '../';

export const typeDefs = gql`
  extend type Mutation {
    """
    Creates a new chat.
    """
    createChat(name: String, picture: String): Chat

    """
    Deletes a chat.
    """
    deleteChat(chatId: ID!): Chat

    """
    Adds a user to a chat.
    """
    addUserToChat(chatId: ID!, userId: ID!): ChatUser

    """
    Removes a user from a chat.
    """
    removeUserFromChat(chatId: ID!, userId: ID!): ChatUser
  }
`;

const createChatSchema = yup.object().shape({
  name: yup
    .string()
    .min(1, 'Chat name must be at least 1 character long')
    .max(30, 'Chat name must be at most 30 characters long')
    .required(),
  picture: yup.string(),
});

export const resolvers = {
  Mutation: {
    createChat: async (
      _: any,
      { name, picture }: { name: string; picture: string },
      { authService, sequelize }: Context
    ) => {
      try {
        await createChatSchema.validate({ name, picture });
      } catch (err: any) {
        throw new GraphQLError(err.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await sequelize.transaction(async (transaction) => {
          const chat = await Chat.create(
            { name, picture, creator_id: authService.getUserId() },
            { transaction }
          );
          await ChatUser.create(
            { chat_id: chat.id, user_id: authService.getUserId() },
            { transaction }
          );
          return chat;
        });
      } catch (err: any) {
        throw new GraphQLError(err.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    },

    deleteChat: async (
      _: any,
      { chatId }: { chatId: string },
      { authService, sequelize }: Context
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const chat = await Chat.findByPk(chatId);
      if (chat === null) {
        throw new GraphQLError('Chat not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const creator = await ChatUser.findOne({
        where: {
          chat_id: chatId,
          user_id: authService.getUserId(),
        },
      });
      if (creator === null) {
        throw new GraphQLError('Only the creator can delete the chat', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      try {
        return await sequelize.transaction(async (transaction) => {
          await Chat.destroy({ where: { id: chatId }, transaction });
          await ChatUser.destroy({ where: { chat_id: chatId }, transaction });
          return chat;
        });
      } catch (err: any) {
        throw new GraphQLError(err.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    },

    addUserToChat: async (
      _: any,
      { chatId, userId }: { chatId: string; userId: string },
      { authService }: Context
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await User.findByPk(userId);
      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const chat = await Chat.findByPk(chatId);
      if (chat === null) {
        throw new GraphQLError('Chat not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // TODO: Implement blocked validation

      const [chatUser, isCreated] = await ChatUser.findOrCreate({
        where: { chat_id: chatId, user_id: userId },
        defaults: { chat_id: chatId, user_id: userId },
      });
      if (!isCreated) {
        throw new GraphQLError('User already in chat', {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      return chatUser;
    },

    removeUserFromChat: async (
      _: any,
      { chatId, userId }: { chatId: string; userId: string },
      { authService }: Context
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const chat = await Chat.findByPk(chatId);
      if (chat === null) {
        throw new GraphQLError('Chat not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      if (chat.creator_id.toString() !== authService.getUserId()) {
        throw new GraphQLError(
          'Only the creator can remove users from the chat',
          {
            extensions: { code: 'BAD_USER_INPUT' },
          }
        );
      }

      const chatUser = await ChatUser.findOne({
        where: { chat_id: chatId, user_id: userId },
      });
      if (chatUser === null) {
        throw new GraphQLError('User not found in chat', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      await chatUser.destroy();
      return chatUser;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
