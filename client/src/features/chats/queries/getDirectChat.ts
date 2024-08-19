import { gql } from '@apollo/client';

import { RelayConnection } from '@/types/api';
import { MessageNode, PartialUser } from '../types/api';

export const GET_DIRECT_CHAT = gql`
  query GetDirectChat($userId: ID!) {
    directChat(userId: $userId) {
      id
      name
      picture
      users {
        id
        username
        profile_pic
      }
      messages {
        edges {
          cursor
          node {
            id
            creator {
              id
              username
              profile_pic
            }
            formatted_created_at
            formatted_edited_at
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
