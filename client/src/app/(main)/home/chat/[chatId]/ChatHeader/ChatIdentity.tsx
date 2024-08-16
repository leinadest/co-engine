interface ChatIdentityProps {
  picture: string;
  name: string;
}

export default function ChatIdentity({ picture, name }: ChatIdentityProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="profile-circle"></div>
      <h5>{name}</h5>
    </div>
  );
}
