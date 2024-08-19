import { QueryHookOptions, useQuery } from '@apollo/client';

import { GET_CHAT, GetChatData, GetChatVariables } from '../queries/getChat';

export default function useChat(
  chatId: string,
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const result = useQuery<GetChatData, GetChatVariables>(GET_CHAT, {
    ...options,
    variables: { id: chatId },
  });

  return result;
}
