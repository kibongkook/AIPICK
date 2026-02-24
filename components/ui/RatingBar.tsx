interface RatingBarProps {
  value: 1 | 2 | 3 | 4 | 5;
  label?: string;
  max?: number;
}

export default function RatingBar({ value, label, max = 5 }: RatingBarProps) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-gray-500 shrink-0 w-12">{label}</span>}
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <div
            key={i}
            className={`h-2 w-5 rounded-sm ${
              i < value ? 'bg-primary' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
