import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonBlock() {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Skeleton type="avatar" />
      <Skeleton type="h5" className="w-40" />
      <button className="flex-none ml-auto rounded-full size-8 bg-bgSecondary focus-by-brightness">
        ✕
      </button>
    </div>
  );
}
