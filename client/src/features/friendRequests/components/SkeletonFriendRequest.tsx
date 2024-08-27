import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonFriendRequest() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Skeleton type="avatar" />
      <div>
        <Skeleton type="h5" className="w-40" />
        <Skeleton type="body" className="w-40" />
      </div>
      <button className="ml-auto rounded-full size-8 bg-bgSecondary">✓</button>
      <button className="rounded-full size-8 bg-bgSecondary">✕</button>
    </div>
  );
}
