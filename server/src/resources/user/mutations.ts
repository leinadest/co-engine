import { gql } from 'graphql-tag';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql/error/GraphQLError';

import { User } from '../';
import AuthService from '../../services/authService';
import { type Context } from '../../config/apolloServer';

const typeDefs = gql`
  input CreateUserInput {
    username: String!
    email: String!
    password: String!
  }

  input EditMeInput {
    username: String
    email: String
    profilePic: String
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
    createUser(user: CreateUserInput!): User

    """
    Edit a user's account information.
    """
    editMe(edit: EditMeInput!): Boolean

    """
    Generates a new access token, if provided credentials (username and password) match any registered user.
    """
    authenticate(credentials: AuthenticateInput!): AuthenticatePayload
  }
`;

interface CreateUserInput {
  user: {
    username: string;
    email: string;
    password: string;
  };
}

interface EditMeInput {
  edit?: {
    username?: string;
    email?: string;
    profilePic?: string;
  };
}

interface AuthenticateInput {
  credentials: {
    email: string;
    password: string;
  };
}

const createUserInputSchema = yup.object().shape({
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

const editMeInputSchema = yup.object().shape({
  edit: yup.object().shape({
    username: yup
      .string()
      .optional()
      .min(3, 'Username must be between 3 and 30 characters long')
      .max(30, 'Username must be between 3 and 30 characters long')
      .matches(
        /^[a-zA-Z0-9]+$/,
        'Username must contain only letters or numbers'
      )
      .lowercase(),
    email: yup
      .string()
      .optional()
      .matches(
        /^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/,
        'Email must be a valid email'
      ),
    profilePic: yup.string(),
  }),
});

const authenticateInputSchema = yup.object().shape({
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

const resolvers = {
  Mutation: {
    createUser: async (_parent: any, args: CreateUserInput) => {
      const validArgs = await createUserInputSchema.validate(args, {
        stripUnknown: true,
      });
      const { username, email, password } = validArgs.user;

      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail !== null) {
        throw new GraphQLError(
          `Email ${email} is already taken. Choose another email`,
          { extensions: { code: 'EMAIL_TAKEN' } }
        );
      }

      const passwordHash = await bcrypt.hash(password, 10);

      return await User.create({
        email,
        username,
        password_hash: passwordHash,
      });
    },
    editMe: async (_: any, args: EditMeInput, { authService }: Context) => {
      const validArgs = await editMeInputSchema.validate(args);
      const {
        edit: { username, email, profilePic },
      } = validArgs;

      const userId = authService.getUserId();
      if (userId === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const [affectedCount] = await User.update(
        { username, email, profile_pic: profilePic },
        { where: { id: userId } }
      );
      if (affectedCount === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return affectedCount > 0;
    },
    authenticate: async (_parentValue: any, args: AuthenticateInput) => {
      const validArgs = await authenticateInputSchema.validate(args, {
        stripUnknown: true,
      });
      const { email, password } = validArgs.credentials;

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
