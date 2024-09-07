import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_FRIENDS, {
  GetFriendsResult,
  GetFriendsVariables,
} from '@/graphql/queries/getFriends';
import { useEffect, useState } from 'react';
import { snakeToCamel } from '@/utils/helpers';
import { RelayConnection } from '@/types/api';

export default function useFriends(
  options?: QueryHookOptions<GetFriendsResult, GetFriendsVariables>
) {
  const [friends, setFriends] = useState<RelayConnection<any>>();

  const { data, loading, error, refetch, fetchMore, variables } = useQuery(
    GET_FRIENDS,
    {
      ...options,
      notifyOnNetworkStatusChange: true,
    }
  );

  useEffect(() => {
    if (data) {
      setFriends(snakeToCamel(data.friends));
    }
  }, [data]);

  function handleFetchMore() {
    const canFetchMore = data?.friends.pageInfo.hasNextPage && !loading;
    if (!canFetchMore) return;
    const endCursor = data?.friends.pageInfo.endCursor;
    fetchMore({ variables: { ...variables, after: endCursor } });
  }

  return {
    data: friends,
    setData: setFriends,
    loading,
    error,
    refetch,
    fetchMore: handleFetchMore,
  };
}
