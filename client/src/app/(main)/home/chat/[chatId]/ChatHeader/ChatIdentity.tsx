import ProfilePic from '@/components/users/ProfilePic';

interface ChatIdentityProps {
  picture: string;
  name: string;
}

export default function ChatIdentity({ picture, name }: ChatIdentityProps) {
  return (
    <div className="flex items-center gap-2">
      <ProfilePic src={picture} defaultSrc={'/chat.png'} alt="chat" />
      <h5>{name}</h5>
    </div>
  );
}
