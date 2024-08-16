import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonChatIdentity() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton type="avatar" />
      <Skeleton type="h5" className="w-40" />
    </div>
  );
}
