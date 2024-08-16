import { RelayConnection } from '@/types/api';
import { gql, QueryHookOptions, useQuery } from '@apollo/client';

const GET_BLOCKED = gql`
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
    }
  }
`;

interface GetBlockedData {
  blocked: RelayConnection<{
    id: string;
    username: string;
    discriminator: string;
    profile_pic: string;
  }>;
}

interface UsersInput {
  search?: string;
  orderDirection?: string;
  orderBy?: string;
  after?: string;
  first?: number;
}

export default function useBlocked(
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const blockedQuery = useQuery<GetBlockedData, UsersInput>(
    GET_BLOCKED,
    options
  );
  return blockedQuery;
}
