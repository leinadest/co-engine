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

export interface GetMeVariables {
  after?: string;
  first?: number;
  search?: string;
  orderBy?: string;
  orderDirection?: string;
}

export const GET_ME: TypedDocumentNode<GetMeResult, GetMeVariables> = gql`
  query GetMe(
    $after: String
    $first: Int
    $search: String
    $orderBy: String
    $orderDirection: String
  ) {
    me {
      id
      created_at
      email
      username
      discriminator
      profile_pic
      profile_pic_url
      bio
      chats(
        after: $after
        first: $first
        search: $search
        orderBy: $orderBy
        orderDirection: $orderDirection
      ) {
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
