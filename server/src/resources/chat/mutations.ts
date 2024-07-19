import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';

import Chat from './model';
import ChatUser from '../chat_user/model';
import { type Context } from '../../config/apolloServer';
import User from '../user/model';

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

export const resolvers = {
  Mutation: {
    createChat: async (
      _: any,
      { name, picture }: { name: string; picture: string },
      { authService, sequelize }: Context
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      try {
        return await sequelize.transaction(async (transaction) => {
          const chat = await Chat.create({ name, picture }, { transaction });
          await ChatUser.create(
            {
              chat_id: chat.id,
              user_id: authService.getUserId(),
              is_creator: true,
            },
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
          is_creator: true,
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

      const chat = await Chat.findByPk(chatId);
      if (chat === null) {
        throw new GraphQLError('Chat not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const user = await User.findByPk(userId);
      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      // TODO: Implement blocked validation

      return await ChatUser.findOrCreate({
        where: {
          chat_id: chatId,
          user_id: userId,
        },
      });
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

      const self = await ChatUser.findOne({
        where: { chat_id: chatId, user_id: authService.getUserId() },
      });
      if (self === null || !self.is_creator) {
        throw new GraphQLError(
          'Only the creator can remove users from the chat',
          {
            extensions: { code: 'BAD_USER_INPUT' },
          }
        );
      }

      const chatUser = await ChatUser.destroy({
        where: { chat_id: chatId, user_id: userId },
      });
      if (chatUser === 0) {
        throw new GraphQLError('User not found in chat', {
          extensions: { code: 'NOT_FOUND' },
        });
      }
      return chatUser;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
