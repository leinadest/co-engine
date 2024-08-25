import { QueryHookOptions, useQuery } from '@apollo/client';

import {
  GET_CHAT,
  GetChatData as GetChatResult,
  GetChatVariables,
} from '../../../graphql/queries/getChat';

export default function useChat(
  chatId: string,
  options?: QueryHookOptions<GetChatResult, GetChatVariables>
) {
  const { data, loading, error, fetchMore } = useQuery(GET_CHAT, {
    ...options,
    variables: { id: chatId },
    notifyOnNetworkStatusChange: true,
    skip: !chatId,
  });

  function fetchMoreMessages() {
    const canFetchMore = data?.chat.messages.pageInfo.hasNextPage && !loading;
    const endCursor = data?.chat.messages.pageInfo.endCursor;

    if (!canFetchMore) return;

    fetchMore({
      variables: { messagesQuery: { after: endCursor } },
      updateQuery: (previousResult, { fetchMoreResult }) => {
        const newEdges = fetchMoreResult?.chat.messages.edges;
        const newPageInfo = fetchMoreResult?.chat.messages.pageInfo;
        return {
          ...previousResult,
          chat: {
            ...previousResult.chat,
            messages: {
              ...previousResult.chat.messages,
              edges: [...previousResult.chat.messages.edges, ...newEdges],
              pageInfo: newPageInfo,
            },
          },
        };
      },
    });
  }

  return { data, loading, error, fetchMoreMessages };
}
