import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($userId: ID!) {
    user(userId: $userId) {
      id
      username
      discriminator
      created_at
      last_login_at
      is_online
      profile_pic
      bio
    }
  }
`;

export interface GetUserData {
  user: {
    id: string;
    username: string;
    discriminator: string;
    created_at: string;
    last_login_at: string;
    is_online: boolean;
    profile_pic: string;
    bio: string;
  };
}
