import Skeleton from '@/components/skeletons/Skeleton';
import Image from 'next/image';

export default function SkeletonUser() {
  return (
    <div className="flex items-center gap-2 px-4 py-1 bg-bgSecondary dark:bg-bgSecondary-dark">
      <Skeleton
        type="avatar"
        className="bg-bgSecondaryDark dark:bg-bgSecondaryDark-dark"
      />
      <Skeleton type="body" className="mr-auto w-32 bg-bgSecondaryDark" />
    </div>
  );
}
