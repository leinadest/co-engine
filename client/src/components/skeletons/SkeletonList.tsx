import { ReactNode } from 'react';

interface SkeletonListProps {
  top?: ReactNode;
  skeleton: JSX.Element;
  length?: number;
  className?: string;
}

export default function SkeletonList({
  top,
  skeleton,
  length = 10,
  className,
}: SkeletonListProps) {
  return (
    <div className="size-full overflow-auto">
      <ul className={className}>
        {top}
        {Array.from({ length }, (_, i) => {
          return <li key={i}>{skeleton}</li>;
        })}
      </ul>
    </div>
  );
}
