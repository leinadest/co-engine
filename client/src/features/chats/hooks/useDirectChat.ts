import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  GetDirectChatData,
  GetDirectChatVariables,
  GET_DIRECT_CHAT,
} from '../queries/getDirectChat';

export default function useDirectChat(
  userId: string,
  options?: QueryHookOptions<NoInfer<any>, NoInfer<any>>
) {
  const { data, loading, error } = useQuery<
    GetDirectChatData,
    GetDirectChatVariables
  >(GET_DIRECT_CHAT, { ...options, variables: { userId } });

  return {
    directChat: data?.directChat,
    loading,
    error,
  } as const;
}
