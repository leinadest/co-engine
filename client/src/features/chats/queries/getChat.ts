import { gql, TypedDocumentNode } from '@apollo/client';

import { RelayConnection } from '@/types/api';
import { MessageNode, PartialUser } from '../types/api';

export interface GetChatData {
  chat: {
    id: string;
    name: string;
    picture: string;
    users: PartialUser[];
    messages: RelayConnection<MessageNode>;
  };
}

export interface GetChatVariables {
  id: string;
}

export const GET_CHAT: TypedDocumentNode<GetChatData, GetChatVariables> = gql`
  query GetChat($id: ID!) {
    chat(id: $id) {
      id
      name
      picture
      users {
        id
        username
        discriminator
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
              discriminator
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
