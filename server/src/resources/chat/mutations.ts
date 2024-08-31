import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import * as yup from 'yup';

import { type Context } from '../../config/apolloServer';
import { Chat, ChatUser, User } from '../';

export const typeDefs = gql`
  extend type Mutation {
    """
    Creates a new chat with the specified user.
    """
    createChat(username: String, discriminator: String): Chat

    """
    Deletes a chat.
    """
    deleteChat(chatId: ID!): Chat

    """
    Adds a user to a chat.
    """
    addUserToChat(
      chatId: ID!
      username: String
      discriminator: String
    ): ChatUser

    """
    Removes a user from a chat.
    """
    removeUserFromChat(
      chatId: ID!
      username: String
      discriminator: String
    ): ChatUser
  }
`;

interface CreateChatInput {
  username: string;
  discriminator: string;
}

interface AddUserToChatInput {
  chatId: string;
  username: string;
  discriminator: string;
}

interface RemoveUserFromChatInput extends AddUserToChatInput {}

const createChatSchema = yup.object().shape({
  username: yup.string().trim(),
  discriminator: yup.string().trim(),
});

const addUserToChatSchema = yup.object().shape({
  chatId: yup.string().trim(),
  username: yup.string().trim(),
  discriminator: yup.string().trim(),
});

const removeUserFromChatSchema = addUserToChatSchema;

export const resolvers = {
  Mutation: {
    createChat: async (
      _: any,
      args: CreateChatInput,
      { authService, sequelize }: Context
    ) => {
      const validArgs = await createChatSchema.validate(args);
      const { username, discriminator } = validArgs;

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const otherUser = await User.findOne({
        where: { username, discriminator },
      });
      if (otherUser === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      try {
        return await sequelize.transaction(async (transaction) => {
          const chat = await Chat.create(
            { creator_id: authService.getUserId() },
            { transaction }
          );
          await ChatUser.bulkCreate(
            [
              { chat_id: chat.id, user_id: authService.getUserId() },
              { chat_id: chat.id, user_id: otherUser.id },
            ],
            { transaction }
          );
          return chat;
        });
      } catch (err: any) {
        const message =
          err.name === 'SequelizeUniqueConstraintError'
            ? 'User cannot start a chat with themselves'
            : (err.message as string);
        throw new GraphQLError(message, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
    },

    deleteChat: async (
      _: any,
      { chatId }: { chatId: string },
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

      await Chat.destroy({ where: { id: chatId } });
      return chat;
    },

    addUserToChat: async (
      _: any,
      args: AddUserToChatInput,
      { authService }: Context
    ) => {
      const { chatId, username, discriminator } =
        await addUserToChatSchema.validate(args);

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const user = await User.findOne({ where: { username, discriminator } });
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

      const [chatUser, isCreated] = await ChatUser.findOrCreate({
        where: { chat_id: chatId, user_id: user.id },
        defaults: { chat_id: chatId, user_id: user.id },
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
      args: RemoveUserFromChatInput,
      { authService }: Context
    ) => {
      const { chatId, username, discriminator } =
        await removeUserFromChatSchema.validate(args);

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

      const user = await User.findOne({ where: { username, discriminator } });
      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const userIsCreator =
        chat.creator_id.toString() === authService.getUserId();
      const userIsRemovingOtherUser =
        user.id.toString() !== authService.getUserId();
      if (!userIsCreator && userIsRemovingOtherUser) {
        throw new GraphQLError(
          'Only the creator can remove other users from the chat',
          {
            extensions: { code: 'UNAUTHORIZED' },
          }
        );
      }

      const chatUser = await ChatUser.findOne({
        where: { chat_id: chatId, user_id: user.id },
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
