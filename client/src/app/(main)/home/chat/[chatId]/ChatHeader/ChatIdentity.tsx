import Avatar from '@/components/Avatar';

interface ChatIdentityProps {
  picture: string;
  name: string;
}

export default function ChatIdentity({ picture, name }: ChatIdentityProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar src={picture} defaultSrc={'/chat.png'} alt="chat" />
      <h5>{name}</h5>
    </div>
  );
}
