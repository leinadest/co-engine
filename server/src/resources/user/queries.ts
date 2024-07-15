import { gql } from 'graphql-tag';
import User from './model';
import type AuthService from '../../services/authService';

export const typeDefs = gql`
  extend type Query {
    """
    Returns the authenticated user.
    """
    me: User
  }
`;

export const resolvers = {
  Query: {
    me: async (
      _parentValue: any,
      _args: any,
      { authService }: { authService: AuthService }
    ) => {
      const userId = authService.getUserId();
      if (userId === null) {
        throw new Error('Not authenticated');
      }
      return await User.findByPk(userId);
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
