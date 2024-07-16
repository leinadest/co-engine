import { gql } from 'graphql-tag';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql/error/GraphQLError';

import User from './model';
import AuthService from '../../services/authService';

export const typeDefs = gql`
  input CreateUserInput {
    username: String!
    email: String!
    password: String!
  }

  input AuthenticateInput {
    email: String!
    password: String!
  }

  extend type Mutation {
    """
    Creates a new user, if the provided email does not already exist.
    """
    createUser(user: CreateUserInput): User

    """
    Generates a new access token, if provided credentials (username and password) match any registered user.
    """
    authenticate(credentials: AuthenticateInput): AuthenticatePayload
  }
`;

const userSchema = yup.object().shape({
  user: yup.object().shape({
    username: yup.string().min(1).max(30).lowercase().trim(),
    email: yup.string().email().trim(),
    password: yup.string().min(5).max(50).trim(),
  }),
});

const credSchema = yup.object().shape({
  credentials: yup.object().shape({
    email: yup.string().email().trim(),
    password: yup.string().min(5).max(50).trim(),
  }),
});

const createPasswordHash = async (password: string): Promise<string> =>
  await bcrypt.hash(password, 10);

export const resolvers = {
  Mutation: {
    createUser: async (_parent: any, args: any) => {
      const { username, email, password } = userSchema.validateSync(args, {
        stripUnknown: true,
      }).user;

      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail !== null) {
        throw new GraphQLError(
          `Email ${email} is already taken. Choose another email`,
          { extensions: { code: 'EMAIL_TAKEN' } }
        );
      }

      const passwordHash = await createPasswordHash(password as string);

      return await User.create({
        email,
        username,
        password_hash: passwordHash,
      });
    },
    authenticate: async (
      _parentValue: any,
      args: Omit<User, 'username'>,
      { authService }: { authService: AuthService }
    ) => {
      const validatedArgs = await credSchema.validate(args, {
        stripUnknown: true,
      });
      const { email, password } = validatedArgs.credentials;

      const user = await User.findOne({ where: { email } });
      if (user === null) {
        throw new GraphQLError('Email not found', {
          extensions: { code: 'EMAIL_NOT_FOUND' },
        });
      }

      const passwordIsValid = await bcrypt.compare(
        password as string,
        user.getDataValue('password_hash') as string
      );
      if (!passwordIsValid) {
        throw new GraphQLError('Incorrect password', {
          extensions: { code: 'INCORRECT_PASSWORD' },
        });
      }

      return {
        user,
        ...AuthService.createAccessToken(user.id),
      };
    },
  },
};

export default {
  typeDefs,
  resolvers,
};
