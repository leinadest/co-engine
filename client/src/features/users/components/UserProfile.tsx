import ProfilePic from '@/components/users/ProfilePic';
import { formatTime } from '@/utils/helpers';
import { DateTime } from 'luxon';

interface UserProfileProps {
  profilePicUrl?: string;
  username: string;
  discriminator: string;
  bio?: string;
  createdAt: string;
}

export default function UserProfile({
  profilePicUrl,
  username,
  discriminator,
  bio,
  createdAt,
}: UserProfileProps) {
  return (
    <>
      <ProfilePic
        src={profilePicUrl}
        defaultSrc="/person.png"
        alt="profile"
        className="mx-auto mb-2 content-center size-40 bg-bgSecondaryDark *:size-24"
      />
      <h1 className="mb-4 text-center">
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
