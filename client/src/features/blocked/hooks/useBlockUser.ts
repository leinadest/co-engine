import { MutationHookOptions, useMutation } from '@apollo/client';

import BLOCK_USER, {
  BlockUserResult,
  BlockUserVariables,
} from '@/graphql/mutations/blockUser';

export default function useBlockUser(
  options?: MutationHookOptions<BlockUserResult, BlockUserVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(BLOCK_USER, options);

  function blockUser(userId: string) {
    return mutate({ variables: { userId } });
  }

  return { blockUser, data: data?.blockUser, loading, error };
}
