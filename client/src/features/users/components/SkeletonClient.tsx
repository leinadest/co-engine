import Image from 'next/image';

import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonClient() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-bgSecondary">
      <Skeleton type="avatar" />
      <Skeleton type="h5" className="grow" />
      <Image
        src="/settings.png"
        alt="settings"
        width={26}
        height={26}
        className="mr-2"
      />
    </div>
  );
}
