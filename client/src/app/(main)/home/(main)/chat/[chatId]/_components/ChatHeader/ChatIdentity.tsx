import Avatar from '@/components/Avatar';

interface ChatIdentityProps {
  src?: string;
  defaultSrc?: string;
  name: string;
}

export default function ChatIdentity({
  src,
  defaultSrc,
  name,
}: ChatIdentityProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar src={src} defaultSrc={defaultSrc || '/chat.png'} alt="chat" />
      <h5>{name}</h5>
    </div>
  );
}
