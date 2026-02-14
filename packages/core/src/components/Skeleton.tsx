interface SkeletonProps {
  count?: number;
}

export function Skeleton({ count = 5 }: SkeletonProps) {
  return (
    <div className="pro-calendr-react-skeleton">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="pro-calendr-react-skeleton-bar" />
      ))}
    </div>
  );
}
