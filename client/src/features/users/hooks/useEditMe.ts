import { MutationHookOptions, useMutation } from '@apollo/client';

import EDIT_ME, { EditMeResult, EditMeVariables } from '../mutations/editUser';

export default function useEditMe(
  options?: MutationHookOptions<EditMeResult, EditMeVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(EDIT_ME, options);

  function editMe(edit: EditMeVariables['edit']) {
    return mutate({ variables: { edit } });
  }

  return { editMe, data, loading, error };
}
