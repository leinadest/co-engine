import { MutationHookOptions, useMutation } from '@apollo/client';

import UPDATE_ME, {
  UpdateMeResult,
  UpdateMeVariables,
} from '../../../graphql/mutations/updateMe';
import { GET_ME } from '../../../graphql/queries/getMe';
import { useCallback } from 'react';

export default function useUpdateMe(
  options?: MutationHookOptions<UpdateMeResult, UpdateMeVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(UPDATE_ME, {
    ...options,
    update(cache, { data }) {
      if (!data || !data.updateMe) {
        return;
      }
      cache.updateQuery({ query: GET_ME }, (prevData) => {
        if (!prevData) {
          return prevData;
        }
        return { me: { ...prevData.me, ...data.updateMe } };
      });
    },
  });

  const updateMe = useCallback(
    (update: UpdateMeVariables['update']) => mutate({ variables: { update } }),
    [mutate]
  );

  return { updateMe, data: data?.updateMe, loading, error };
}
