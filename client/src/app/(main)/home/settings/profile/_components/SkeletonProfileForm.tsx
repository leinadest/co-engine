import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonProfileForm() {
  return (
    <div className="flex flex-col mx-auto h-full max-w-screen-lg">
      <div className="relative mx-auto mb-2">
        <Skeleton
          type="avatar"
          className="mx-auto !size-40 bg-bgSecondaryDark"
        />
        <button className="btn absolute bottom-14 -right-20">Edit</button>
      </div>
      <Skeleton type="h5" className="mx-auto mb-4 w-40" />

      <h5>Display Name</h5>
      <Skeleton type="input" className="mb-4 w-full bg-bgSecondary" />

      <h5>About Me</h5>
      <Skeleton type="input" className="mb-4 w-full !h-40 bg-bgSecondary" />

      <h5 className="mt-4">Member Since</h5>
      <Skeleton type="body" className="w-40" />

      <div className="flex justify-center gap-4 mt-auto">
        <button className="btn-disabled">Reset</button>
        <button className="btn-disabled">Save Changes</button>
      </div>
    </div>
  );
}
