import { MutationHookOptions, useMutation } from '@apollo/client';

import DELETE_FRIENDSHIP, {
  DeleteFriendshipResult,
  DeleteFriendshipVariables,
} from '@/graphql/mutations/deleteFriendship';
import GET_FRIENDS from '@/graphql/queries/getFriends';

export default function useDeleteFriendship(
  options?: MutationHookOptions<
    DeleteFriendshipResult,
    DeleteFriendshipVariables
  >
) {
  const [mutate, { data, loading, error }] = useMutation(DELETE_FRIENDSHIP, {
    ...options,
    update(cache, { data }, { variables }) {
      if (!data || !data.deleteFriendship || !variables) {
        return;
      }
      cache.updateQuery({ query: GET_FRIENDS }, (prevData) => {
        if (!prevData) {
          return prevData;
        }
        const newEdges = prevData.friends.edges.filter(
          ({ node: friend }) => friend.id !== variables.friendId
        );
        return {
          friends: {
            edges: newEdges,
            pageInfo: prevData.friends.pageInfo,
          },
        };
      });
      cache.updateQuery(
        { query: GET_FRIENDS, variables: { status: 'online' } },
        (prevData) => {
          if (!prevData) {
            return prevData;
          }
          const newEdges = prevData.friends.edges.filter(
            ({ node: friend }) => friend.id !== variables.friendId
          );
          return {
            friends: {
              edges: newEdges,
              pageInfo: prevData.friends.pageInfo,
            },
          };
        }
      );
    },
  });

  function deleteFriendship(friendId: string) {
    return mutate({ variables: { friendId } });
  }

  return { deleteFriendship, data: data?.deleteFriendship, loading, error };
}
