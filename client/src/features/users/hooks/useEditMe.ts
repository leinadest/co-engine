import { MutationHookOptions, useMutation } from '@apollo/client';

import EDIT_ME, {
  EditMeResult,
  EditMeVariables,
} from '../../../graphql/mutations/editUser';
import { GET_ME } from '../../../graphql/queries/getMe';

export default function useEditMe(
  options?: MutationHookOptions<EditMeResult, EditMeVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(EDIT_ME, {
    ...options,
    update(cache, { data }) {
      if (!data || !data.editMe) {
        return;
      }
      cache.updateQuery({ query: GET_ME }, (prevData) => {
        if (!prevData) {
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
