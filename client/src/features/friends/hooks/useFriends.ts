import { RelayConnection } from '@/types/api';
import { gql, QueryHookOptions, useQuery } from '@apollo/client';

const GET_FRIENDS = gql`
  query GetFriends($query: FriendsInput) {
    friends(query: $query) {
      edges {
        cursor
        node {
          id
          username
          discriminator
          last_login_at
          is_online
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

interface Friends {
  friends: RelayConnection<{
    id: string;
    username: string;
    discriminator: string;
    last_login_at: string;
    is_online: boolean;
    profile_pic: string;
  }>;
}

interface useFriendsArgs extends QueryHookOptions<Friends, any> {
  status?: 'online' | 'offline';
}

export default function useFriends(options?: useFriendsArgs) {
  const { data, loading, error } = useQuery<Friends>(GET_FRIENDS, {
    ...options,
    variables: { query: { status: options?.status } },
  });
  return { data, loading, error };
}
