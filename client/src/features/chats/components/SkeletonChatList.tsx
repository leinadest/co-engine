import SkeletonChat from './SkeletonChat';

export default function SkeletonChatList() {
  return (
    <div className="grow basis-0 min-h-0 flex flex-col ">
      <div className="flex justify-between p-2 text-bold">
        <p>Direct Messages</p>
        <button>+</button>
      </div>
      <ul className="grow basis-0 min-h-0 overflow-auto">
        {Array.from({ length: 10 }).map((_, index) => (
          <SkeletonChat key={index} />
        ))}
      </ul>
    </div>
  );
}
