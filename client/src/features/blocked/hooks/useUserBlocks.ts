import { QueryHookOptions, useQuery } from '@apollo/client';

import GET_USER_BLOCKS, {
  GetUserBlocksResult,
  GetUserBlocksVariables,
} from '../../../graphql/queries/getUserBlocks';

export default function useUserBlocks(
  options?: QueryHookOptions<GetUserBlocksResult, GetUserBlocksVariables>
) {
  const { data, loading, error, refetch, fetchMore, variables } = useQuery(
    GET_USER_BLOCKS,
    {
      ...options,
      notifyOnNetworkStatusChange: true,
    }
  );

  function handleFetchMore() {
    const canFetchMore = data?.userBlocks.pageInfo.hasNextPage && !loading;
    if (!canFetchMore) return;
    const endCursor = data?.userBlocks.pageInfo.endCursor;
    fetchMore({ variables: { ...variables, after: endCursor } });
  }

  return {
    data: data?.userBlocks,
    loading,
    error,
    refetch,
    fetchMore: handleFetchMore,
  };
}
