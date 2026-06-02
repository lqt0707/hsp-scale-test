'use client';

interface ProgressBarProps {
  total: number;
  answeredCount: number;
}

export default function ProgressBar({ total, answeredCount }: ProgressBarProps) {
  const progress = answeredCount / total;

  return (
    <div className="w-full max-w-xl mx-auto px-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[3px] bg-parchment rounded-full overflow-hidden">
          <div
            className="h-full bg-sage-300 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <span className="text-[11px] text-ink-faint whitespace-nowrap tabular-nums">
          {answeredCount}/{total}
        </span>
      </div>
    </div>
  );
}
