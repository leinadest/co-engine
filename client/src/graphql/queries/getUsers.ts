import { RelayConnection } from '@/types/api';
import { gql, TypedDocumentNode } from '@apollo/client';

export interface GetUsersResult {
  users: RelayConnection<{
    id: string;
    username: string;
    discriminator: string;
    display_name: string;
    last_login_at: string;
    is_online: boolean;
    profile_pic_url: string;
  }>;
}

export interface GetUsersVariables {
  search?: string;
  contextType: 'chat' | 'channel';
  contextId: string;
  after?: string;
  first?: number;
  orderDirection?: string;
  orderBy?: string;
}

const GET_USERS: TypedDocumentNode<GetUsersResult, GetUsersVariables> = gql`
  query GetUsers(
    $search: String
    $contextType: String
    $contextId: String
    $after: String
    $first: Int
    $orderDirection: String
    $orderBy: String
  ) {
    users(
      search: $search
      contextType: $contextType
      contextId: $contextId
      after: $after
      first: $first
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

export default GET_USERS;
