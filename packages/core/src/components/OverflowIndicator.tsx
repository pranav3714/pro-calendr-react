interface OverflowIndicatorProps {
  count: number;
}

export function OverflowIndicator({ count }: OverflowIndicatorProps) {
  return <button className="pro-calendr-react-overflow">+{count} more</button>;
}
