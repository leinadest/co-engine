import { RelayConnection } from '@/types/api';
import { gql, TypedDocumentNode } from '@apollo/client';

export interface GetFriendsResult {
  friends: RelayConnection<{
    id: string;
    username: string;
    discriminator: string;
    display_name: string;
    last_login_at: string;
    is_online: boolean;
    profile_pic_url: string;
  }>;
}

export interface GetFriendsVariables {
  after?: string;
  first?: number;
  status?: string;
  search?: string;
  orderDirection?: string;
  orderBy?: string;
}

const GET_FRIENDS: TypedDocumentNode<
  GetFriendsResult,
  GetFriendsVariables
> = gql`
  query GetFriends(
    $after: String
    $first: Int
    $status: String
    $search: String
    $orderDirection: String
    $orderBy: String
  ) {
    friends(
      after: $after
      first: $first
      status: $status
      search: $search
      orderDirection: $orderDirection
      orderBy: $orderBy
    ) {
      edges {
        cursor
        node {
          id
          username
          discriminator
          display_name
          last_login_at
          is_online
          profile_pic_url
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
        startCursor
      }
      totalCount
    }
  }
`;

export default GET_FRIENDS;
