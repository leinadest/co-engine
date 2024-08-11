import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonChat() {
  return (
    <Skeleton className="grid grid-cols-[48px_1fr] px-2 py-1 gap-2 bg-bgPrimary">
      <Skeleton type="avatar" />
      <div className="flex flex-col justify-center">
        <div className="grid grid-cols-[1fr_50px] gap-2 items-center">
          <Skeleton type="body" />
          <Skeleton type="body-xs" />
        </div>
        <Skeleton type="body-xs" />
      </div>
    </Skeleton>
  );
}
