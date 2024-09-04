import { gql } from 'graphql-tag';
import * as yup from 'yup';
import bcrypt from 'bcrypt';
import { GraphQLError } from 'graphql/error/GraphQLError';
import { type FileUpload } from 'graphql-upload/processRequest.js';

import { User } from '../';
import AuthService from '../../services/authService';
import { pubsub, type Context } from '../../config/apolloServer';
import { deleteImage, uploadImage } from '../../services/cloudinaryService';

const typeDefs = gql`
  input CreateUserInput {
    username: String!
    email: String!
    password: String!
  }

  input UpdateMeInput {
    username: String
    email: String
    isOnline: Boolean
    lastLoginAt: DateTime
    bio: String
  }

  input UploadMeInput {
    profilePic: Upload
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
    Update a user's information.
    """
    updateMe(update: UpdateMeInput!): User

    """
    Upload a user's information.
    """
    uploadMe(upload: UploadMeInput!): User

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

interface UpdateMeInput {
  update: {
    username?: string;
    email?: string;
    isOnline?: boolean;
    lastLoginAt?: Date;
    bio?: string;
  };
}

interface UploadMeInput {
  upload: {
    profilePic: Promise<FileUpload>;
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

const updateMeInputSchema = yup.object().shape({
  update: yup.object().shape({
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
    isOnline: yup.boolean().optional(),
    lastLoginAt: yup.date().optional(),

    bio: yup.string().max(200, 'Bio cannot be longer than 200 characters'),
  }),
});

const uploadMeInputSchema = yup.object().shape({
  profilePic: yup
    .mixed<Promise<FileUpload> | any>()
    .test('isFile', 'Profile picture must be a file', async (value) => {
      const file = await value;
      return value === undefined || 'filename' in file;
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
    updateMe: async (_: any, args: UpdateMeInput, { authService }: Context) => {
      const validArgs = await updateMeInputSchema.validate(args);
      const {
        update: { isOnline, username, email, lastLoginAt, bio },
      } = validArgs;

      const user = await authService.getUser();
      if (user === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      const [affectedCount, affectedUsers] = await User.update(
        {
          username,
          email,
          is_online: isOnline,
          last_login_at: lastLoginAt,
          bio,
        },
        { where: { id: user.id }, returning: true }
      );
      if (affectedCount === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      await pubsub.publish('userUpdated', { userUpdated: affectedUsers[0] });

      return affectedUsers[0];
    },
    uploadMe: async (_: any, args: UploadMeInput, { authService }: Context) => {
      const { profilePic } = await uploadMeInputSchema.validate(args);

      const user = await authService.getUser();
      if (user === null) {
        throw new GraphQLError('Not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' },
        });
      }

      let profilePicId: string | undefined;
      let profilePicUrl: string | undefined;

      if (profilePic !== undefined && user.profile_pic !== null) {
        await deleteImage(user.profile_pic);
      }
      if (profilePic !== undefined) {
        const fileUpload = (await profilePic) as FileUpload;
        const { publicId, url } = await uploadImage(fileUpload);
        profilePicId = publicId;
        profilePicUrl = url;
      }

      const [affectedCount, affectedUsers] = await User.update(
        {
          profile_pic: profilePicId,
          profile_pic_url: profilePicUrl,
        },
        { where: { id: user.id }, returning: true }
      );
      if (affectedCount === 0) {
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' },
        });
      }

      return affectedUsers[0];
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
