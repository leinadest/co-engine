import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_FRIENDS, {
  GetFriendsResult,
  GetFriendsVariables,
} from '@/graphql/queries/getFriends';

export default function useFriends(
  options?: QueryHookOptions<GetFriendsResult, GetFriendsVariables>
) {
  const { data, loading, error, fetchMore, variables } = useQuery(GET_FRIENDS, {
    ...options,
    notifyOnNetworkStatusChange: true,
  });

  function handleFetchMore() {
    const canFetchMore = data?.friends.pageInfo.hasNextPage && !loading;
    if (!canFetchMore) return;
    const endCursor = data?.friends.pageInfo.endCursor;
    fetchMore({ variables: { ...variables, after: endCursor } });
  }

  return { data: data?.friends, loading, error, fetchMore: handleFetchMore };
}
