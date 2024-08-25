import { MutationHookOptions, useMutation } from '@apollo/client';

import CREATE_CHAT, {
  CreateChatResult as CreateChatResult,
  CreateChatVariables,
} from '@/graphql/mutations/createChat';

export default function useCreateChat(
  options?: MutationHookOptions<CreateChatResult, CreateChatVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(CREATE_CHAT, options);

  function createChat(name?: string, picture?: string) {
    return mutate({ variables: { name, picture } });
  }

  return { createChat, data, loading, error };
}
