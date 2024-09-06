import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_USERS, {
  GetUsersResult,
  GetUsersVariables,
} from '@/graphql/queries/getUsers';

export default function useUsers(
  options?: QueryHookOptions<GetUsersResult, GetUsersVariables>
) {
  const { data, loading, error, fetchMore, variables } = useQuery(GET_USERS, {
    ...options,
    notifyOnNetworkStatusChange: true,
  });

  function handleFetchMore() {
    const canFetchMore = data?.users.pageInfo.hasNextPage && !loading;
    if (!canFetchMore) return;
    const endCursor = data?.users.pageInfo.endCursor;
    fetchMore({ variables: { ...variables, after: endCursor } });
  }

  return { data: data?.users, loading, error, fetchMore: handleFetchMore };
}
