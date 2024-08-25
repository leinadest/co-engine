import { TypedDocumentNode, gql } from '@apollo/client';

import { RelayConnection } from '@/types/api';

export interface GetBlockedData {
  blocked: RelayConnection<{
    id: string;
    username: string;
    discriminator: string;
    profile_pic: string;
  }>;
}

export interface GetBlockedVariables {
  query: {
    search?: string;
    orderDirection?: string;
    orderBy?: string;
    after?: string;
    first?: number;
  };
}

const GET_BLOCKED: TypedDocumentNode<GetBlockedData, GetBlockedVariables> = gql`
  query GetBlocked($query: UsersInput) {
    blocked(query: $query) {
      edges {
        cursor
        node {
          id
          username
          discriminator
          profile_pic
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

export default GET_BLOCKED;
