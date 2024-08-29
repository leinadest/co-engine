import { TypedDocumentNode, gql } from '@apollo/client';

import { RelayConnection } from '@/types/api';

export interface GetUserBlocksResult {
  userBlocks: RelayConnection<{
    blocked_user: {
      id: string;
      username: string;
      discriminator: string;
      profile_pic_url: string;
    };
    created_at: string;
  }>;
}

export interface GetUserBlocksVariables {
  after?: string;
  first?: number;
  orderDirection?: string;
  orderBy?: string;
  search?: string;
}

const GET_USER_BLOCKS: TypedDocumentNode<
  GetUserBlocksResult,
  GetUserBlocksVariables
> = gql`
  query GetUserBlocks(
    $after: String
    $first: Int
    $orderBy: String
    $orderDirection: String
    $search: String
  ) {
    userBlocks(
      after: $after
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      search: $search
    ) {
      edges {
        cursor
        node {
          blocked_user {
            id
            username
            discriminator
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
