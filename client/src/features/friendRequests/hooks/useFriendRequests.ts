import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_FRIEND_REQUESTS, {
  GetFriendRequestsResult,
  GetFriendRequestsVariables,
} from '@/graphql/queries/getFriendRequests';

export default function useFriendRequests(
  kind: 'incoming' | 'outgoing' = 'incoming',
  options?: QueryHookOptions<
    GetFriendRequestsResult,
    GetFriendRequestsVariables
  >
) {
  const type = kind === 'incoming' ? 'received' : 'sent';
  const { data, loading, error } = useQuery(GET_FRIEND_REQUESTS, {
    ...options,
    variables: { query: { type } },
  });
  return { data: data?.userFriendRequests, loading, error };
}
