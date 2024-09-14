import SkeletonChatIdentity from '../[chatId]/_components/ChatHeader/SkeletonChatIdentity';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonMessage from '@/features/messages/components/SkeletonMessage';

export default function SkeletonChatPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="flex items-center px-4 py-2 gap-6 border-b overflow-clip">
        <SkeletonChatIdentity />
      </header>
      <main className="grow overflow-auto min-w-96">
        <SkeletonList skeleton={<SkeletonMessage />} />
      </main>
      <div className="grow">
        <input
          type="text"
          name="message"
          placeholder="Enter your message"
          className="w-full"
        />
      </div>
    </div>
  );
}
