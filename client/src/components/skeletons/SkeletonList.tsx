interface SkeletonListProps {
  skeleton: JSX.Element;
  length?: number;
  className?: string;
}

export default function SkeletonList({
  skeleton,
  length = 10,
  className,
}: SkeletonListProps) {
  return (
    <ul className={className}>
      {Array.from({ length }, (_, i) => {
        return <li key={i}>{skeleton}</li>;
      })}
    </ul>
  );
}
