import SkeletonMessageList from '@/features/messages/components/SkeletonMessageList';
import SkeletonChatIdentity from './[chatId]/ChatHeader/SkeletonChatIdentity';

export default function SkeletonChatPage() {
  return (
    <div className="flex flex-col">
      <header className="flex items-center p-2 gap-6 overflow-clip">
        <SkeletonChatIdentity />
      </header>
      <main className="grow p-2 border-t overflow-auto min-w-96">
        <SkeletonMessageList />
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
