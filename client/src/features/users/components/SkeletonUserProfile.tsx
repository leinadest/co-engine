import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonUserProfile() {
  return (
    <>
      <Skeleton className="mx-auto mb-2 rounded-full content-center size-40 bg-bgSecondaryDark" />
      <Skeleton type="h1" className="mx-auto w-80" />
      <h5>About Me</h5>
      <hr className="my-2" />
      <Skeleton type="body" />
      <Skeleton type="body" />
      <Skeleton type="body" />
      <h5 className="mt-4">Member Since</h5>
      <Skeleton type="body" className="w-40" />
    </>
  );
}
