import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonProfileForm() {
  return (
    <div className="flex flex-col h-full">
      <div className="relative mx-auto mb-2">
        <Skeleton
          type="avatar"
          className="min-w-40 min-h-40 bg-bgSecondaryDark"
        />
        <button className="btn absolute bottom-14 -right-20">Edit</button>
      </div>
      <Skeleton type="h1" className="mx-auto mb-4 w-80" />

      <h5>About Me</h5>
      <Skeleton type="input" className="grow max-h-40 bg-bgSecondary" />

      <h5 className="mt-4">Member Since</h5>
      <Skeleton type="body" className="mb-4 w-40" />

      <div className="flex gap-4 mt-auto mx-auto">
        <button className="btn-disabled">Reset</button>
        <button className="btn-disabled">Save Changes</button>
      </div>
    </div>
  );
}
