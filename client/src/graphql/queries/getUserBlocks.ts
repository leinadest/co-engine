import { TypedDocumentNode, gql } from '@apollo/client';

import { RelayConnection } from '@/types/api';

export interface GetUserBlocksResult {
  userBlocks: RelayConnection<{
    blocked_user: {
      id: string;
      username: string;
      discriminator: string;
      display_name: string;
      profile_pic_url: string;
    };
    created_at: string;
  }>;
}

export interface GetUserBlocksVariables {
  search?: string;
  after?: string;
  first?: number;
  orderDirection?: string;
  orderBy?: string;
}

const GET_USER_BLOCKS: TypedDocumentNode<
  GetUserBlocksResult,
  GetUserBlocksVariables
> = gql`
  query GetUserBlocks(
    $search: String
    $after: String
    $first: Int
    $orderBy: String
    $orderDirection: String
  ) {
    userBlocks(
      search: $search
      after: $after
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
    ) {
      edges {
        cursor
        node {
          blocked_user {
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
        hasPreviousPage
        endCursor
        startCursor
      }
      totalCount
    }
  }
`;

export default GET_USER_BLOCKS;
