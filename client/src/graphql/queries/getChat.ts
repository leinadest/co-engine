import { gql, TypedDocumentNode } from '@apollo/client';

import { RelayConnection } from '@/types/api';

interface PartialUser {
  id: string;
  username: string;
  discriminator: string;
  display_name: string;
  is_online: boolean;
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
  search?: string;
  after?: string;
  first?: number;
  orderDirection?: string;
  orderBy?: string;
}

export const GET_CHAT: TypedDocumentNode<GetChatData, GetChatVariables> = gql`
  query GetChat(
    $id: ID!
    $search: String
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
        display_name
        is_online
        profile_pic_url
      }
      messages(
        search: $search
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
              display_name
              is_online
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
