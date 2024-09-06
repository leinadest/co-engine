import { RelayConnection } from '@/types/api';
import { gql, TypedDocumentNode } from '@apollo/client';

export interface GetFriendRequestsResult {
  userFriendRequests: RelayConnection<{
    sender: {
      id: string;
      username: string;
      discriminator: string;
      display_name: string;
      profile_pic_url: string;
    };
    receiver: {
      id: string;
      username: string;
      discriminator: string;
      display_name: string;
      profile_pic_url: string;
    };
    created_at: string;
  }>;
}

export interface GetFriendRequestsVariables {
  type?: 'sent' | 'received';
  orderBy?: string;
  orderDirection?: string;
  after?: string;
  first?: number;
}

const GET_FRIEND_REQUESTS: TypedDocumentNode<
  GetFriendRequestsResult,
  GetFriendRequestsVariables
> = gql`
  query GetFriendRequests(
    $after: String
    $first: Int
    $orderBy: String
    $orderDirection: String
    $type: String
  ) {
    userFriendRequests(
      after: $after
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      type: $type
    ) {
      totalCount
      edges {
        cursor
        node {
          sender {
            id
            username
            discriminator
            display_name
            profile_pic_url
          }
          receiver {
            id
            username
            discriminator
            display_name
            profile_pic_url
          }
          created_at
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export default GET_FRIEND_REQUESTS;
