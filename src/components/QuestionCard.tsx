'use client';

interface QuestionCardProps {
  questionText: string;
  selectedValue: number | null;
  onSelect: (value: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

const OPTION_LABELS: Record<number, string> = {
  1: '完全不像我',
  2: '不太像我',
  3: '有些不那么像我',
  4: '说不上来',
  5: '有些像我',
  6: '比较像我',
  7: '非常像我',
};

export default function QuestionCard({
  questionText,
  selectedValue,
  onSelect,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto animate-question-in" key={questionNumber}>
      {/* 题号提示 — 极简 */}
      <p className="text-xs text-ink-faint mb-4 tracking-wide">
        {questionNumber} / {totalQuestions}
      </p>

      {/* 题目文字 — 衬线字体，温暖感 */}
      <p className="font-[family-name:var(--font-display)] text-xl sm:text-2xl text-ink leading-relaxed mb-10 font-normal">
        &ldquo;{questionText}&rdquo;
      </p>

      {/* 选项 — 无数字，纯文字描述 */}
      <div className="space-y-2.5 stagger-children">
        {[1, 2, 3, 4, 5, 6, 7].map((value) => {
          const isSelected = selectedValue === value;
          return (
            <button
              key={value}
              onClick={() => onSelect(value)}
              className={`
                w-full text-left px-5 py-3.5 rounded-2xl transition-all duration-300
                focus-soft cursor-pointer
                ${isSelected
                  ? 'bg-sage-100 border-sage-400 text-sage-700'
                  : 'bg-white/50 border-parchment text-ink-light hover:bg-sage-50 hover:border-sage-200'
                }
                border-[1.5px]
              `}
            >
              <span className="text-sm sm:text-[0.9375rem] leading-snug">
                {OPTION_LABELS[value]}
              </span>
              {isSelected && (
                <span className="ml-2 text-sage-400 text-xs">&#10003;</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
