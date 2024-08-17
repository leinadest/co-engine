import { gql } from '@apollo/client';

import { RelayConnection } from '@/types/api';

export const GET_ME = gql`
  query GetMe {
    me {
      id
      created_at
      email
      username
      discriminator
      profile_pic
      bio
      chats {
        edges {
          cursor
          node {
            id
            name
            picture
            last_message_at
            last_message
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

export interface GetMeData {
  me: {
    id: string;
    created_at: string;
    email: string;
    username: string;
    discriminator: string;
    profile_pic: string;
    bio: string;
    chats: RelayConnection<{
      id: string;
      name: string;
      picture: string;
      last_message_at: string;
      last_message: string;
    }>;
  };
}
