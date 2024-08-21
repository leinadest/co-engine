import { formatTime } from '@/utils/helpers';
import { DateTime } from 'luxon';

interface UserProfileProps {
  profilePic?: string;
  username: string;
  discriminator: string;
  bio?: string;
  createdAt: string;
}

export default function UserProfile({
  profilePic,
  username,
  discriminator,
  bio,
  createdAt,
}: UserProfileProps) {
  return (
    <>
      <div className="mx-auto mb-2 rounded-full content-center size-40 bg-bgSecondaryDark"></div>
      <h1 className="text-center">
        {username}#{discriminator}
      </h1>
      <h5>About Me</h5>
      <hr className="my-2" />
      <p>{bio ?? 'No bio'}</p>
      <h5 className="mt-4">Member Since</h5>
      <p>{formatTime(createdAt, DateTime.DATE_MED)}</p>
    </>
  );
}
