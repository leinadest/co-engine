import { gql, TypedDocumentNode } from '@apollo/client';

import { RelayConnection } from '@/types/api';

interface PartialUser {
  id: string;
  username: string;
  discriminator: string;
  profile_pic_url: string;
}

interface MessageNode {
  id: string;
  creator: PartialUser;
  created_at: string;
  edited_at: string | null;
  content: string;
  reactions: Array<{ reactor_id: string; reaction: string }>;
}

export interface GetChatData {
  chat: {
    id: string;
    creator_id: string;
    name: string;
    picture: string;
    users: PartialUser[];
    messages: RelayConnection<MessageNode>;
  };
}

export interface GetChatVariables {
  id: string;
  after?: string;
  first?: number;
  orderDirection?: string;
  orderBy?: string;
}

export const GET_CHAT: TypedDocumentNode<GetChatData, GetChatVariables> = gql`
  query GetChat(
    $id: ID!
    $after: String
    $first: Int
    $orderDirection: String
    $orderBy: String
  ) {
    chat(id: $id) {
      id
      creator_id
      name
      picture
      users {
        id
        username
        discriminator
        profile_pic_url
      }
      messages(
        after: $after
        first: $first
        orderDirection: $orderDirection
        orderBy: $orderBy
      ) {
        edges {
          cursor
          node {
            id
            creator {
              id
              username
              discriminator
              profile_pic_url
            }
            created_at
            edited_at
            content
            reactions {
              reactor_id
              reaction
            }
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
