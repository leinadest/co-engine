import { gql, TypedDocumentNode } from '@apollo/client';

export interface GetUserResult {
  user: {
    id: string;
    username: string;
    discriminator: string;
    created_at: string;
    last_login_at: string;
    is_online: boolean;
    profile_pic: string;
    profile_pic_url: string;
    bio: string;
  };
}

export interface GetUserVariables {
  userId: string;
}

export const GET_USER: TypedDocumentNode<GetUserResult, GetUserVariables> = gql`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id
      username
      discriminator
      created_at
      last_login_at
      is_online
      profile_pic
      profile_pic_url
      bio
    }
  }
`;
