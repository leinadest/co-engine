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
    <ul className={className + ' size-full overflow-auto'}>
      {top}
      {Array.from({ length }, (_, i) => {
        return <li key={i}>{skeleton}</li>;
      })}
    </ul>
  );
}
