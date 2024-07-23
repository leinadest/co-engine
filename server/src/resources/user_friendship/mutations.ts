import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { Op } from 'sequelize';

import type AuthService from '../../services/authService';
import { User, UserFriendship } from '../';

export const typeDefs = gql`
  extend type Mutation {
    """
    Sends a friend request to the specified user.
    """
    requestFriendship(userId: ID!): UserFriendship

    """
    Accepts a friend request from the specified user.
    """
    acceptFriendship(userId: ID!): UserFriendship

    """
    Deletes a friendship with the specified user.
    """
    deleteFriendship(userId: ID!): UserFriendship
  }
`;

export const resolvers = {
  Mutation: {
    requestFriendship: async (
      _parent: any,
      { userId }: { userId: string },
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (authService.getUserId() === userId) {
        throw new GraphQLError('Cannot send friend request to yourself', {
          extensions: { code: 'CANNOT_FRIEND_SELF' },
        });
      }

      const user = await User.findByPk(userId);

      if (user === null) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'USER_NOT_FOUND' },
        });
      }

      const friendship = await UserFriendship.findOne({
        where: {
          [Op.or]: [
            { sender_id: userId, receiver_id: authService.getUserId() },
            { sender_id: authService.getUserId(), receiver_id: userId },
          ],
        },
      });

      if (friendship !== null) {
        throw new GraphQLError('Friendship already exists', {
          extensions: { code: 'FRIENDSHIP_ALREADY_EXISTS' },
        });
      }

      return await UserFriendship.create({
        sender_id: authService.getUserId(),
        receiver_id: userId,
      });
    },
    acceptFriendship: async (
      _parent: any,
      { userId }: { userId: string },
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (authService.getUserId() === userId) {
        throw new GraphQLError('Cannot accept friend request from yourself', {
          extensions: { code: 'CANNOT_FRIEND_SELF' },
        });
      }

      const friendship = await UserFriendship.findOne({
        where: { sender_id: userId, receiver_id: authService.getUserId() },
      });
      if (friendship === null) {
        throw new GraphQLError('Friend request not found', {
          extensions: { code: 'FRIEND_REQUEST_NOT_FOUND' },
        });
      }

      friendship.accepted_at = new Date();
      friendship.status = 'accepted';
      return await friendship.save();
    },
    deleteFriendship: async (
      _parent: any,
      { userId }: { userId: string },
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      if (authService.getUserId() === userId) {
        throw new GraphQLError('Cannot delete friend request from yourself', {
          extensions: { code: 'CANNOT_FRIEND_SELF' },
        });
      }

      const friendship = await UserFriendship.findOne({
        where: {
          [Op.or]: [
            { sender_id: userId, receiver_id: authService.getUserId() },
            { sender_id: authService.getUserId(), receiver_id: userId },
          ],
        },
      });
      if (friendship === null) {
        throw new GraphQLError('Friend request not found', {
          extensions: { code: 'FRIEND_REQUEST_NOT_FOUND' },
        });
      }

      await friendship.destroy();

      return friendship;
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
