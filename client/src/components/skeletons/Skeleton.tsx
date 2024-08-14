interface SkeletonProps {
  type?: 'h5' | 'h6' | 'body' | 'body-sm' | 'body-xs' | 'avatar' | 'container';
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
