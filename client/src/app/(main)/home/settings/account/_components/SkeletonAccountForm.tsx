import Skeleton from '@/components/skeletons/Skeleton';

export default function SkeletonAccountForm() {
  return (
    <div className="flex flex-col grow">
      <div className="form-group">
        <label className="font-bold">Username</label>
        <Skeleton type="input" />
      </div>
      <div className="form-group">
        <label className="font-bold">Email</label>
        <Skeleton type="input" />
      </div>
      <div className="flex gap-4 mt-auto mx-auto">
        <button className="btn-disabled">Reset</button>
        <button className="btn-disabled">Save Changes</button>
      </div>
    </div>
  );
}
