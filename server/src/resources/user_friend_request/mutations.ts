import { gql } from 'graphql-tag';
import { GraphQLError } from 'graphql/error/GraphQLError';

import type AuthService from '../../services/authService';
import { User, UserFriendRequest } from '../';
import { type Context } from '../../config/apolloServer';
import { Op } from 'sequelize';

const typeDefs = gql`
  extend type Mutation {
    """
    Sends a friend request to the specified user.
    """
    sendFriendRequest(userId: ID!): UserFriendRequest

    """
    Accepts a friend request from the specified user.
    """
    acceptFriendRequest(userId: ID!): Boolean

    """
    Deletes a friend request.
    """
    deleteFriendRequest(senderId: ID!, receiverId: ID!): Boolean
  }
`;

const resolvers = {
  Mutation: {
    sendFriendRequest: async (
      _parent: any,
      { userId }: { userId: string },
      { authService, dataSources }: Context
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
          extensions: { code: 'NOT_FOUND' },
        });
      }

      const [friendRequest, created] = await UserFriendRequest.findOrCreate({
        where: {
          [Op.or]: [
            { sender_id: authService.getUserId(), receiver_id: userId },
            {
              sender_id: userId,
              receiver_id: authService.getUserId(),
            },
          ],
        },
        defaults: {
          sender_id: authService.getUserId(),
          receiver_id: userId,
        },
      });

      if (!created) {
        throw new GraphQLError('Friend request already exists between users', {
          extensions: { code: 'FRIEND_REQUEST_ALREADY_EXISTS' },
        });
      }

      return friendRequest;
    },
    acceptFriendRequest: async (
      _parent: any,
      { userId }: { userId: string },
      { authService, dataSources }: Context
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

      const friendRequest = await UserFriendRequest.findOne({
        where: { sender_id: userId, receiver_id: authService.getUserId() },
      });
      if (friendRequest === null) {
        throw new GraphQLError('Friend request not found', {
          extensions: { code: 'FRIEND_REQUEST_NOT_FOUND' },
        });
      }

      return await dataSources.friendRequestsDB.acceptFriendRequest(userId);
    },
    deleteFriendRequest: async (
      _parent: any,
      { senderId, receiverId }: { senderId: string; receiverId: string },
      { authService }: { authService: AuthService }
    ) => {
      if (authService.getUserId() === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const result = await UserFriendRequest.destroy({
        where: { sender_id: senderId, receiver_id: receiverId },
      });
      if (result === 0) {
        throw new GraphQLError('Friend request not found', {
          extensions: { code: 'FRIEND_REQUEST_NOT_FOUND' },
        });
      }

      return true;
    },
  },
};

export default { typeDefs, resolvers };
