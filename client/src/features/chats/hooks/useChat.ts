import { QueryHookOptions, useQuery } from '@apollo/client';

import { GET_CHAT } from '../queries/getChat';

export default function useChat(
  chatId: string,
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const { data, loading, error } = useQuery(GET_CHAT, {
    ...options,
    variables: { id: chatId },
    skip: !chatId,
  });
  return { data, loading, error };
}
