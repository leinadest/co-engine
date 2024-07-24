import { gql } from 'graphql-tag';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { escape } from 'lodash';

import { Chat, Message, User } from '../';
import type AuthService from '../../services/authService';

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
  // TODO: Implement channel context and permission checks
  Mutation: {
    createMessage: async (
      _: any,
      { message }: { message: CreateMessageInput },
      { authService }: { authService: AuthService }
    ) => {
      try {
        await createMessageInputSchema.validate({ message });
      } catch (error: any) {
        throw new GraphQLError(error.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const contextUserQuery = {
        where: { id: authService.getUserId() },
        include: {
          model: Chat,
          where: { id: message.contextId },
        },
      };
      const userIsInContext = (await User.findOne(contextUserQuery)) !== null;
      if (!userIsInContext) {
        throw new GraphQLError('User not found in context', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const createdMessage = await Message.create({
        context_type: message.contextType,
        context_id: message.contextId,
        creator_id: authService.getUserId(),
        content: message.content,
      });
      return createdMessage.toJSON();
    },
    editMessage: async (
      _: any,
      { messageId, content }: EditMessageInput,
      { authService }: { authService: AuthService }
    ) => {
      try {
        await editMessageInputSchema.validate({ messageId, content });
      } catch (error: any) {
        throw new GraphQLError(error.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

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

      const contextModel = message.context_type === 'chat' ? Chat : Chat;
      const contextUserQuery = {
        include: {
          model: contextModel,
          where: { id: message.context_id },
        },
        where: { id: authService.getUserId() },
      };
      const contextUser = await User.findOne(contextUserQuery);
      if (contextUser === null) {
        throw new GraphQLError('User not found in context', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      message.content = content;
      message.edited_at = new Date();
      await message.save();

      return message.toJSON();
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
