import { gql, TypedDocumentNode } from '@apollo/client';

import { RelayConnection } from '@/types/api';

interface PartialUser {
  id: string;
  username: string;
  discriminator: string;
  display_name: string;
  profile_pic_url: string;
  is_online: boolean;
}

interface MessageNode {
  id: string;
  creator: PartialUser;
  created_at: string;
  edited_at: string | null;
  content: string;
  reactions: Array<{ reactor_id: string; reaction: string }>;
}

export interface GetDirectChatData {
  directChat: {
    id: string;
    name: string;
    picture: string;
    users: PartialUser[];
    messages: RelayConnection<MessageNode>;
  };
}

export interface GetDirectChatVariables {
  userId: string;
}

const GET_DIRECT_CHAT: TypedDocumentNode<
  GetDirectChatData,
  GetDirectChatVariables
> = gql`
  query GetDirectChat($userId: ID!) {
    directChat(userId: $userId) {
      id
      name
      picture
      users {
        id
        username
        discriminator
        display_name
        profile_pic_url
        is_online
      }
      messages {
        edges {
          cursor
          node {
            id
            creator {
              id
              username
              discriminator
              display_name
              profile_pic_url
              is_online
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

export default GET_DIRECT_CHAT;
