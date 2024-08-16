interface SkeletonListProps {
  skeleton: JSX.Element;
}

export default function SkeletonList({ skeleton }: SkeletonListProps) {
  return (
    <ul>
      {Array.from({ length: 10 }, (_, i) => {
        return <li key={i}>{skeleton}</li>;
      })}
    </ul>
  );
}
