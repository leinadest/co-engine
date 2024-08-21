import {
  gql,
  MutationHookOptions,
  TypedDocumentNode,
  useMutation,
} from '@apollo/client';

interface BlockUserResult {
  blockUser: {
    blocked_user_id: string;
    created_at: string;
  };
}

interface BlockUserVariables {
  userId: string;
}

const BLOCK_USER: TypedDocumentNode<BlockUserResult, BlockUserVariables> = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId) {
      blocked_user_id
      created_at
    }
  }
`;

export default function useBlockUser(
  options?: MutationHookOptions<BlockUserResult, BlockUserVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(BLOCK_USER, options);

  function blockUser(userId: string) {
    return mutate({ variables: { userId } });
  }

  return { blockUser, data, loading, error };
}
