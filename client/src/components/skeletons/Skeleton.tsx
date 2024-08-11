interface SkeletonProps {
  type?: 'h5' | 'body' | 'body-xs' | 'avatar' | 'container';
  className?: string;
  children?: React.ReactNode;
}

export default function Skeleton({ type, className, children }: SkeletonProps) {
  return (
    <div className={`skeleton ${type ?? ''} ${className ?? ''}`}>
      {children}
    </div>
  );
}
