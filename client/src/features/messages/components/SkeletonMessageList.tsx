import SkeletonMessage from './SkeletonMessage';

export default function SkeletonMessageList() {
  return (
    <ul className="flex flex-col gap-4">
      {Array.from({ length: 10 }, (_, i) => (
        <SkeletonMessage key={i} />
      ))}
    </ul>
  );
}
