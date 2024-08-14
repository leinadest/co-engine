import Skeleton from '@/components/skeletons/Skeleton';

export default function Message() {
  return (
    <div className="flex px-2 gap-4">
      <Skeleton type="avatar" />
      <div className="grow flex flex-col gap-1">
        <div className="flex gap-4">
          <Skeleton type="h6" className="w-40" />
          <Skeleton type="body-sm" className="w-60" />
        </div>
        <Skeleton type="body-sm" className="w-full" />
        <Skeleton type="body-sm" className="w-full" />
        <Skeleton type="body-sm" className="w-full" />
      </div>
    </div>
  );
}
