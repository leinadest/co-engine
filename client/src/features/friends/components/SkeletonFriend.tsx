import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonFriend() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Skeleton type="avatar" />
      <div>
        <Skeleton type="h5" className="w-40" />
        <Skeleton type="body" className="w-20" />
      </div>
    </div>
  );
}
