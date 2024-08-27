'use client';

import useSendFriendRequest from '@/features/friendRequests/hooks/useSendFriendRequest';
import { FormEvent, useState } from 'react';

export default function AddFriends() {
  const { sendFriendRequestByUsername, data, loading, error } =
    useSendFriendRequest();
  const [form, setForm] = useState<{ search?: string; error?: string }>({});

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setForm({});

    const formData = new FormData(event.target as HTMLFormElement);
    const search = formData.get('search') as string | undefined;

    if (!search) {
      setForm({ error: 'Search value is required' });
      return;
    }

    const [username, discriminator] = search.split('#');
    setForm({ search: `${username}#${discriminator ?? 0}` });
    sendFriendRequestByUsername(username, discriminator ?? '0');
  }

  return (
    <main className="mx-auto p-4 w-full max-w-screen-lg *:mb-2">
      <h5>Add Friends</h5>
      <p>Search by username and discriminator to find users to befriend.</p>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-4">
        <input
          type="text"
          name="search"
          placeholder="Enter username#discriminator"
          className="grow"
        />
        <button className="btn">Send Friend Request</button>
      </form>
      {!loading &&
        (form.error || error ? (
          <p className="text-error">{form.error || error?.message}.</p>
        ) : (
          data && (
            <>
              <p className="text-success">
                Friend request successfully sent to{' '}
                <span className="font-bold">{form.search}.</span>
              </p>
            </>
          )
        ))}
    </main>
  );
}
