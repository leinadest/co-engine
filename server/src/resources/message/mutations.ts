import { gql } from 'graphql-tag';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { escape } from 'lodash';
// import { type ClientSession } from 'mongoose';

import { Chat, ChatUser, Message } from '..';
import type AuthService from '../../services/authService';
import { transaction } from '../../utils/api';
import { type Transaction } from 'sequelize';
import { type IMessage } from './model';
import { pubsub } from '../../config/apolloServer';

export const typeDefs = gql`
  input CreateMessageInput {
    contextType: String!
    contextId: String!
    content: String!
  }

  extend type Mutation {
    """
    Creates a new message.
    """
    createMessage(message: CreateMessageInput!): Message!

    """
    Edits a pre-existing message.
    """
    editMessage(messageId: ID!, content: String!): Message!
  }
`;

interface CreateMessageInput {
  contextType: string;
  contextId: string;
  content: string;
}

interface EditMessageInput {
  messageId: string;
  content: string;
}

const createMessageInputSchema = yup.object().shape({
  message: yup.object().shape({
    contextType: yup
      .string()
      .trim()
      .oneOf(['chat', 'channel'], 'Context must be either chat or channel')
      .required('Context type is required'),
    contextId: yup.string().trim().required('Context id is required'),
    content: yup
      .string()
      .trim()
      .required('Content is required')
      .max(10000, 'Content must be at most 10000 characters long')
      .transform((val: string) => escape(val)),
  }),
});

const editMessageInputSchema = yup.object().shape({
  messageId: yup.string().trim().required('Message ID is required'),
  content: yup
    .string()
    .trim()
    .required('Content is required')
    .max(10000, 'Content must be at most 10000 characters long')
    .transform((val: string) => escape(val)),
});

export const createPasswordHash = async (password: string): Promise<string> =>
  await bcrypt.hash(password, 10);

export const resolvers = {
  Mutation: {
    createMessage: async (
      _: any,
      { message }: { message: CreateMessageInput },
      { authService }: { authService: AuthService }
    ) => {
      await createMessageInputSchema.validate({ message });

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      let contextUser: ChatUser | null = null;

      if (message.contextType === 'chat') {
        contextUser = await ChatUser.findOne({
          where: {
            chat_id: message.contextId,
            user_id: authService.getUserId(),
          },
        });
      }

      if (contextUser === null) {
        throw new GraphQLError('User not found in context', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const createMessageAndUpdateContext = async (
        transaction: Transaction
        // session: ClientSession
      ): Promise<IMessage & Required<{ _id: unknown }>> => {
        const newMessage = new Message({
          context_type: message.contextType,
          context_id: message.contextId,
          creator_id: authService.getUserId(),
          content: message.content,
        });
        const messageContext = message.contextType === 'chat' ? Chat : Chat;

        const [createdMessage] = await Promise.all([
          newMessage.save({
            // session
          }),
          messageContext.update(
            { last_message: message.content, last_message_at: new Date() },
            { where: { id: message.contextId }, transaction }
          ),
        ]);

        return await createdMessage.toJSON();
      };

      const result = await transaction({
        run: createMessageAndUpdateContext,
        errorMessage: 'createMessage transaction failed',
      });

      await pubsub.publish('messageCreated', { messageCreated: result });

      return result;
    },
    editMessage: async (
      _: any,
      { messageId, content }: EditMessageInput,
      { authService }: { authService: AuthService }
    ) => {
      await editMessageInputSchema.validate({ messageId, content });

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const message = await Message.findById(messageId);

      if (message === null) {
        throw new GraphQLError('Message not found', {
          extensions: {
            code: 'NOT_FOUND',
          },
        });
      }

      if (message.creator_id.toString() !== authService.getUserId()) {
        throw new GraphQLError('Not authorized', {
          extensions: {
            code: 'FORBIDDEN',
          },
        });
      }

      let contextUser: ChatUser | null = null;

      if (message.context_type === 'chat') {
        contextUser = await ChatUser.findOne({
          where: {
            chat_id: message.context_id,
            user_id: authService.getUserId(),
          },
        });
      }

      if (contextUser === null) {
        throw new GraphQLError('User not found in context', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const updateMessageAndUpdateContext = async (
        transaction: Transaction
        // session: ClientSession
      ): Promise<IMessage & Required<{ _id: unknown }>> => {
        message.content = content;
        message.edited_at = new Date();
        const messageContext = message.context_type === 'chat' ? Chat : Chat;

        const [updatedMessage] = await Promise.all([
          message.save({
            // session
          }),
          messageContext.update(
            { last_message: content, last_message_at: new Date() },
            { where: { id: message.context_id }, transaction }
          ),
        ]);

        return await updatedMessage.toJSON();
      };

      const result = await transaction({
        run: updateMessageAndUpdateContext,
        errorMessage: 'editMessage transaction failed',
      });

      await pubsub.publish('messageEdited', { messageEdited: result });

      return result;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
