import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  GET_ME,
  GetMeResult,
  GetMeVariables,
} from '../../../graphql/queries/getMe';

export default function useMe(
  options?: QueryHookOptions<GetMeResult, GetMeVariables>
) {
  const { data, loading, error, refetch, fetchMore, variables } = useQuery(
    GET_ME,
    {
      ...options,
      notifyOnNetworkStatusChange: true,
    }
  );

  function fetchMoreChats() {
    const canFetchMore = data?.me.chats.pageInfo.hasNextPage && !loading;
    if (!canFetchMore) return;
    const endCursor = data?.me.chats.pageInfo.endCursor;
    fetchMore({ variables: { ...variables, after: endCursor } });
  }

  return { data: data?.me, loading, error, refetch, fetchMoreChats };
}
