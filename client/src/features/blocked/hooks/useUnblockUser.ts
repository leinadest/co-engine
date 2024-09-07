import { MutationHookOptions, useMutation } from '@apollo/client';

import UNBLOCK_USER, {
  UnblockUserResult,
  UnblockUserVariables,
} from '@/graphql/mutations/unblockUser';
import GET_USER_BLOCKS from '@/graphql/queries/getUserBlocks';

export default function useBlockUser(
  options?: MutationHookOptions<UnblockUserResult, UnblockUserVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(UNBLOCK_USER, {
    ...options,
    update(cache, { data }) {
      if (!data || !data.unblockUser) {
        return;
      }
      cache.updateQuery({ query: GET_USER_BLOCKS }, (prevData) => {
        if (!prevData) {
          return prevData;
        }
        const newEdges = prevData.userBlocks.edges.filter(
          ({ node: block }) =>
            block.blocked_user.id !== data.unblockUser.blocked_user.id
        );
        return {
          userBlocks: {
            edges: newEdges,
            pageInfo: prevData.userBlocks.pageInfo,
          },
        };
      });
    },
  });

  function unblockUser(userId: string) {
    return mutate({ variables: { userId } });
  }

  return { unblockUser, data: data?.unblockUser, loading, error };
}
