import { gql, MutationHookOptions, useMutation } from '@apollo/client';

const CREATE_CHAT = gql`
  mutation CreateChat($name: String, $picture: String) {
    createChat(name: $name, picture: $picture) {
      id
    }
  }
`;

interface CreateChatData {
  createChat: {
    id: string;
  };
}

interface CreateChatVariables {
  name?: string;
  picture?: string;
}

export default function useCreateChat(
  options?: MutationHookOptions<CreateChatData, CreateChatVariables>
) {
  const [mutate, { data, loading, error }] = useMutation<
    CreateChatData,
    CreateChatVariables
  >(CREATE_CHAT, options);

  function createChat(name?: string, picture?: string) {
    return mutate({ variables: { name, picture } });
  }

  return { createChat, data, loading, error };
}
