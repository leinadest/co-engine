import { gql, QueryHookOptions, useQuery } from '@apollo/client';

import { LimitOffsetResult } from '@/types/api';

export const GET_FRIEND_REQUESTS = gql`
  query GetFriendRequests($query: UserFriendRequestsInput) {
    userFriendRequests(query: $query) {
      data {
        sender {
          id
          username
          discriminator
          profile_pic_url
        }
        receiver {
          id
          username
          discriminator
          profile_pic_url
        }
        created_at
      }
      meta {
        totalCount
        page
        pageSize
        totalPages
      }
    }
  }
`;

interface GetFriendRequestsData {
  userFriendRequests: LimitOffsetResult<{
    sender: {
      id: string;
      username: string;
      discriminator: string;
      profile_pic_url: string;
    };
    receiver: {
      id: string;
      username: string;
      discriminator: string;
      profile_pic_url: string;
    };
    created_at: string;
  }>;
}

interface GetFriendRequestsVariables {
  query: {
    type?: string;
    orderBy?: string;
    orderDirection?: string;
    after?: string;
    first?: number;
  };
}

export default function useFriendRequests(
  kind: 'incoming' | 'outgoing' = 'incoming',
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const type = kind === 'incoming' ? 'received' : 'sent';

  return useQuery<GetFriendRequestsData, GetFriendRequestsVariables>(
    GET_FRIEND_REQUESTS,
    {
      ...options,
      variables: { query: { type } },
    }
  );
}
