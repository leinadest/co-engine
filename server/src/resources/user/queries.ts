import { gql } from 'graphql-tag';
import * as yup from 'yup';
import { GraphQLError } from 'graphql/error/GraphQLError';

import User from './model';
import type AuthService from '../../services/authService';

export const typeDefs = gql`
  input UserByNameInput {
    username: String!
    discriminator: String!
  }

  extend type Query {
    """
    Returns the authenticated user.
    """
    me: User

    """
    Returns all users.
    """
    users: [AllUsers!]

    """
    Returns the user with the specified name.
    """
    userByName(name: UserByNameInput): User
  }
`;

interface UserByNameInput {
  name: {
    username: string;
    discriminator: string;
  };
}

const nameSchema = yup.object({
  name: yup.object({
    username: yup.string().required(),
    discriminator: yup.string().required(),
  }),
});

export const resolvers = {
  Query: {
    me: async (
      _parent: any,
      _args: any,
      { authService }: { authService: AuthService }
    ) => {
      const userId = authService.getUserId();
      if (userId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }
      return await User.findByPk(userId);
    },
    users: async () => {
      const users = await User.findAll({
        attributes: ['id', 'username', 'discriminator'],
      });
      return users;
    },
    userByName: async (_parent: any, args: UserByNameInput) => {
      try {
        await nameSchema.validate(args);
      } catch (err: any) {
        throw new GraphQLError(err.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }
      return await User.findOne({
        where: {
          username: args.name.username,
          discriminator: args.name.discriminator,
        },
      });
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
