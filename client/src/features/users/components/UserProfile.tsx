import { twMerge } from 'tailwind-merge';

import Avatar from '@/components/Avatar';
import { formatTime } from '@/utils/helpers';

interface UserProfileProps {
  profilePicUrl?: string;
  displayName: string;
  username: string;
  discriminator: string;
  isOnline: boolean;
  bio?: string;
  createdAt: string;
}

export default function UserProfile({
  profilePicUrl,
  displayName,
  username,
  discriminator,
  isOnline,
  bio,
  createdAt,
}: UserProfileProps) {
  return (
    <>
      <Avatar
        src={profilePicUrl}
        defaultSrc="/person.png"
        alt="profile"
        status={isOnline ? 'online' : 'offline'}
        className={twMerge(
          'mx-auto size-40 xs:size-40 bg-bgSecondaryDark before:size-10',
          profilePicUrl
            ? 'first:*:min-w-40 first:*:min-h-40'
            : 'first:*:size-24 before:size-10'
        )}
      />
      <h1 className="text-center">{displayName}</h1>
      <h5 className="mb-4 text-center">
        {username}#{discriminator}
      </h5>
      <h5>About Me</h5>
      <hr className="my-2" />
      <p>{bio ?? 'No bio'}</p>
      <h5 className="mt-4">Member Since</h5>
      <p>{formatTime(createdAt)}</p>
    </>
  );
}
