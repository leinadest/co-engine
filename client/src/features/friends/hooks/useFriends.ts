import { RelayConnection } from '@/types/api';
import { gql, QueryHookOptions, useQuery } from '@apollo/client';

const GET_FRIENDS = gql`
  query GetFriends {
    friends {
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
    }
  }
`;

interface Friends {
  friends: RelayConnection<{
    id: string;
    username: string;
    discriminator: string;
    last_login_at: string;
    is_online: string;
    profile_pic: string;
  }>;
}

export default function useFriends(
  options: QueryHookOptions<NoInfer<any>, NoInfer<any>> = {}
) {
  const friendsQuery = useQuery<Friends>(GET_FRIENDS, options);
  return friendsQuery;
}
