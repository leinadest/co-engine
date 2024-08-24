import { MutationHookOptions, useMutation } from '@apollo/client';

import EDIT_ME, { EditMeResult, EditMeVariables } from '../mutations/editUser';
import { GET_ME } from '../queries/getMe';

export default function useEditMe(
  options?: MutationHookOptions<EditMeResult, EditMeVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(EDIT_ME, {
    ...options,
    update(cache, { data }) {
      cache.updateQuery({ query: GET_ME }, (prevData) => {
        if (!prevData || !data || !data.editMe) {
          return prevData;
        }
        return { me: { ...prevData.me, ...data.editMe } };
      });
    },
  });

  function editMe(edit: EditMeVariables['edit']) {
    return mutate({ variables: { edit } });
  }

  return { editMe, data, loading, error };
}
