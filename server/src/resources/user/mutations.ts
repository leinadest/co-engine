import { gql } from 'graphql-tag';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { User } from '../';
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

  type AuthenticatePayload {
    user: User!
    accessToken: String!
    expiresAt: DateTime!
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

interface CreateUserInput {
  user: {
    username: string;
    email: string;
    password: string;
  };
}

interface AuthenticateInput {
  credentials: {
    email: string;
    password: string;
  };
}

const userSchema = yup.object().shape({
  user: yup.object().shape({
    username: yup
      .string()
      .required('Username is required')
      .min(3, 'Username must be between 3 and 30 characters long')
      .max(30, 'Username must be between 3 and 30 characters long')
      .matches(
        /^[a-zA-Z0-9]+$/,
        'Username must contain only letters or numbers'
      )
      .lowercase(),
    email: yup
      .string()
      .required('Email is required')
      .matches(
        /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        'Email must be a valid email'
      ),
    password: yup
      .string()
      .required('Password is required')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        'Password must have at least eight characters, including one lowercase letter, one uppercase letter, one number, and one special character'
      ),
  }),
});

const credSchema = yup.object().shape({
  credentials: yup.object().shape({
    email: yup
      .string()
      .required('Email is required')
      .matches(
        /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        'Email must be a valid email'
      ),
    password: yup.string().trim().required('Password is required'),
  }),
});

export const createPasswordHash = async (password: string): Promise<string> =>
  await bcrypt.hash(password, 10);

export const resolvers = {
  Mutation: {
    createUser: async (_parent: any, args: CreateUserInput) => {
      let username, email, password;
      try {
        const user = await userSchema.validate(args, { stripUnknown: true });
        ({ username, email, password } = user.user);
      } catch (err: any) {
        throw new GraphQLError(err.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail !== null) {
        throw new GraphQLError(
          `Email ${email} is already taken. Choose another email`,
          { extensions: { code: 'EMAIL_TAKEN' } }
        );
      }

      const passwordHash = await createPasswordHash(password);

      return await User.create({
        email,
        username,
        password_hash: passwordHash,
      });
    },
    authenticate: async (_parentValue: any, args: AuthenticateInput) => {
      let email, password;
      try {
        const cred = await credSchema.validate(args, { stripUnknown: true });
        ({ email, password } = cred.credentials);
      } catch (err: any) {
        throw new GraphQLError(err.message as string, {
          extensions: { code: 'BAD_USER_INPUT' },
        });
      }

      const user = await User.findOne({ where: { email } });
      if (user === null) {
        throw new GraphQLError('Email not found', {
          extensions: { code: 'EMAIL_NOT_FOUND' },
        });
      }

      const passwordIsValid = await bcrypt.compare(
        password,
        user.password_hash
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
