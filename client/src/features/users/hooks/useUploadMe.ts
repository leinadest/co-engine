import { MutationHookOptions, useMutation } from '@apollo/client';

import UPLOAD_ME, {
  UploadMeResult,
  UploadMeVariables,
} from '@/graphql/mutations/uploadMe';
import { GET_ME } from '@/graphql/queries/getMe';

export default function useUploadMe(
  options?: MutationHookOptions<UploadMeResult, UploadMeVariables>
) {
  const [mutate, { data, loading, error }] = useMutation(UPLOAD_ME, {
    ...options,
    update(cache, { data }) {
      if (!data || !data.uploadMe) {
        return;
      }
      cache.updateQuery({ query: GET_ME }, (prevData) => {
        if (!prevData) {
          return prevData;
        }
        return { me: { ...prevData.me, ...data.uploadMe } };
      });
    },
  });

  function uploadMe(upload: UploadMeVariables['upload']) {
    return mutate({ variables: { upload } });
  }

  return { uploadMe, data: data?.uploadMe, loading, error };
}
