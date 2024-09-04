import { SubscriptionHookOptions, useSubscription } from '@apollo/client';

import USER_UPDATED_SUBSCRIPTION, {
  UserUpdatedSubscriptionResult,
  UserUpdatedSubscriptionVariables,
} from '@/graphql/subscriptions/userUpdated';

export default function useUserUpdated(
  options?: SubscriptionHookOptions<
    UserUpdatedSubscriptionResult,
    UserUpdatedSubscriptionVariables
  >
) {
  const { data, loading, error } = useSubscription(USER_UPDATED_SUBSCRIPTION, {
    ...options,
    skip: !options?.variables?.userIds.length,
  });

  return { data: data?.userUpdated, loading, error };
}
