import { RelayConnection } from '@/types/api';
import {
  gql,
  QueryHookOptions,
  TypedDocumentNode,
  useQuery,
} from '@apollo/client';

interface GetBlockedData {
  blocked: RelayConnection<{
    id: string;
    username: string;
    discriminator: string;
    profile_pic: string;
  }>;
}

interface GetBlockedVariables {
  query?: {
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

export default function useBlocked(
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const { data, loading, error } = useQuery(GET_BLOCKED, options);
  return { data, loading, error };
}
