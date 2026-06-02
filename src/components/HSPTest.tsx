'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import questions from '@/data/hsp-questions.json';
import ProgressBar from './ProgressBar';
import QuestionCard from './QuestionCard';

const TOTAL_QUESTIONS = questions.questions.length;

export default function HSPTest() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(TOTAL_QUESTIONS).fill(null));

  const answeredCount = answers.filter((a) => a !== null).length;
  const currentQuestion = questions.questions[currentIndex];
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1;
  const canSubmit = answeredCount === TOTAL_QUESTIONS;
  const currentAnswered = answers[currentIndex] !== null;

  const handleSelect = useCallback(
    (value: number) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentIndex] = value;
        return next;
      });
    },
    [currentIndex]
  );

  const goNext = () => {
    if (currentIndex < TOTAL_QUESTIONS - 1 && currentAnswered) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const numericAnswers = answers.filter((a) => a !== null) as number[];
    sessionStorage.setItem('hsp-answers', JSON.stringify(numericAnswers));
    router.push('/result');
  };

  const handleAutoAdvance = (value: number) => {
    handleSelect(value);
    if (currentIndex < TOTAL_QUESTIONS - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 500);
    }
  };

  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {/* 顶部 — 极简进度 */}
      <div className="pt-6 pb-2">
        <ProgressBar
          total={TOTAL_QUESTIONS}
          answeredCount={answeredCount}
        />
      </div>

      {/* 题目区域 — 居中，大量留白 */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <QuestionCard
          questionText={currentQuestion.text}
          selectedValue={answers[currentIndex]}
          onSelect={handleAutoAdvance}
          questionNumber={currentIndex + 1}
          totalQuestions={TOTAL_QUESTIONS}
        />
      </div>

      {/* 底部导航 — 柔和，无边界 */}
      <div className="px-6 py-5">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-4 py-2 text-sm text-ink-muted hover:text-ink-light disabled:text-ink-faint disabled:cursor-not-allowed transition-colors focus-soft rounded-xl"
          >
            &larr; 回顾上一题
          </button>

          {isLastQuestion && canSubmit ? (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 text-sm font-medium text-cream-warm bg-sage-600 hover:bg-sage-700 rounded-full transition-all duration-300 focus-soft"
            >
              查看结果 &rarr;
            </button>
          ) : (
            <button
              onClick={goNext}
              disabled={!currentAnswered || isLastQuestion}
              className="px-4 py-2 text-sm text-ink-muted hover:text-ink-light disabled:text-ink-faint disabled:cursor-not-allowed transition-colors focus-soft rounded-xl"
            >
              下一题 &rarr;
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
