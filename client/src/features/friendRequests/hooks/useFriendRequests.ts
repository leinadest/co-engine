import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_FRIEND_REQUESTS, {
  GetFriendRequestsResult,
  GetFriendRequestsVariables,
} from '@/graphql/queries/getFriendRequests';

export default function useFriendRequests(
  options?: QueryHookOptions<
    GetFriendRequestsResult,
    GetFriendRequestsVariables
  >
) {
  const { data, loading, error, refetch, fetchMore, variables } = useQuery(
    GET_FRIEND_REQUESTS,
    {
      ...options,
      notifyOnNetworkStatusChange: true,
      skip: !options?.variables?.type,
    }
  );

  function handleFetchMore() {
    const canFetchMore =
      data?.userFriendRequests.pageInfo.hasNextPage && !loading;
    if (!canFetchMore) return;
    const endCursor = data?.userFriendRequests.pageInfo.endCursor;
    fetchMore({ variables: { ...variables, after: endCursor } });
  }

  return {
    data: data?.userFriendRequests,
    loading,
    error,
    refetch,
    fetchMore: handleFetchMore,
  };
}
