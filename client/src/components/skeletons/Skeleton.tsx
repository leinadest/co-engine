import { twMerge } from 'tailwind-merge';

interface SkeletonProps {
  type?:
    | 'h1'
    | 'h5'
    | 'h6'
    | 'body'
    | 'body-sm'
    | 'body-xs'
    | 'input'
    | 'avatar'
    | 'container';
  className?: string;
  children?: React.ReactNode;
}

export default function Skeleton({ type, className, children }: SkeletonProps) {
  return <div className={twMerge('skeleton', type, className)}>{children}</div>;
}
