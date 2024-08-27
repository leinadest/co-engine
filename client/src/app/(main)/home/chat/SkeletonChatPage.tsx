import SkeletonChatIdentity from './[chatId]/ChatHeader/SkeletonChatIdentity';
import SkeletonList from '@/components/skeletons/SkeletonList';
import SkeletonMessage from '@/features/messages/components/SkeletonMessage';

export default function SkeletonChatPage() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center p-2 gap-6 overflow-clip">
        <SkeletonChatIdentity />
      </header>
      <main className="grow p-2 overflow-auto min-w-96">
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
