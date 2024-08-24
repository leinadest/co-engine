import { gql, TypedDocumentNode } from '@apollo/client';

import { RelayConnection } from '@/types/api';

export interface GetMeResult {
  me: {
    id: string;
    created_at: string;
    email: string;
    username: string;
    discriminator: string;
    profile_pic: string;
    profile_pic_url: string;
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

export const GET_ME: TypedDocumentNode<GetMeResult> = gql`
  query GetMe {
    me {
      id
      created_at
      email
      username
      discriminator
      profile_pic
      profile_pic_url
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
