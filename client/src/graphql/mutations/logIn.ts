import { TypedDocumentNode, gql } from '@apollo/client';

export interface LogInResult {
  authenticate: {
    accessToken: string;
    expiresAt: string;
    user: {
      id: string;
      email: string;
      username: string;
      discriminator: string;
      created_at: string;
      profile_pic: string;
      bio: string;
    };
  };
}

export interface LogInVariables {
  credentials: {
    email: string;
    password: string;
  };
}

const LOG_IN: TypedDocumentNode<LogInResult, LogInVariables> = gql`
  mutation LogIn($credentials: AuthenticateInput!) {
    authenticate(credentials: $credentials) {
      accessToken
      expiresAt
      user {
        id
        email
        username
        discriminator
        created_at
        profile_pic
        bio
      }
    }
  }
`;

export default LOG_IN;
