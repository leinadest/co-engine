import { gql, QueryHookOptions, useQuery } from '@apollo/client';

const GET_FRIEND_REQUESTS = gql`
  query GetFriendRequests($query: UserFriendRequestsInput) {
    userFriendRequests(query: $query) {
      sender {
        id
        username
        discriminator
        profile_pic
      }
      receiver {
        id
        username
        discriminator
        profile_pic
      }
      created_at
    }
  }
`;

interface GetFriendRequestsData {
  userFriendRequests: Array<{
    sender: {
      id: string;
      username: string;
      discriminator: string;
      profile_pic: string;
    };
    receiver: {
      id: string;
      username: string;
      discriminator: string;
      profile_pic: string;
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
