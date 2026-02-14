interface DateNavigationProps {
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  title?: string;
}

export function DateNavigation({ onPrev, onNext, onToday, title }: DateNavigationProps) {
  return (
    <div className="pro-calendr-react-date-nav">
      <button onClick={onToday}>Today</button>
      <button onClick={onPrev}>Prev</button>
      <button onClick={onNext}>Next</button>
      {title && <span>{title}</span>}
    </div>
  );
}
