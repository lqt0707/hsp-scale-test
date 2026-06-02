'use client';

import { useState } from 'react';
import HSPTest from '@/components/HSPTest';

export default function Home() {
  const [started, setStarted] = useState(false);

  if (started) {
    return <HSPTest />;
  }

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full text-center animate-fade-up">
        {/* 装饰性叶子元素 */}
        <div className="mb-10">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto animate-breathe">
            <path
              d="M24 4C24 4 12 12 8 24C4 36 12 44 24 44C24 44 24 28 24 4Z"
              fill="currentColor"
              className="text-sage-300"
              opacity="0.5"
            />
            <path
              d="M24 4C24 4 36 12 40 24C44 36 36 44 24 44C24 44 24 28 24 4Z"
              fill="currentColor"
              className="text-sage-400"
              opacity="0.4"
            />
            <line x1="24" y1="12" x2="24" y2="44" stroke="currentColor" className="text-sage-500" strokeWidth="1" opacity="0.3" />
          </svg>
        </div>

        {/* 标题 */}
        <h1 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-medium text-ink tracking-tight mb-3 leading-snug">
          探索你的敏感性
        </h1>
        <p className="text-ink-muted text-sm mb-10 leading-relaxed max-w-sm mx-auto">
          这是一次温柔的自我觉察之旅，没有对错之分。<br />
          给自己几分钟安静的时间，聆听内心的声音。
        </p>

        {/* 简介卡片 */}
        <div className="text-left space-y-5 mb-10">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-parchment">
            <h2 className="font-[family-name:var(--font-display)] text-base font-medium text-ink mb-2">
              什么是高敏感性？
            </h2>
            <p className="text-sm text-ink-light leading-relaxed">
              高敏感性是一种与生俱来的特质。全球约 15-20% 的人拥有它——对外界的声音、光线、情绪有更细腻的感知，既是挑战，也是一份珍贵的天赋。
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-parchment">
            <h2 className="font-[family-name:var(--font-display)] text-base font-medium text-ink mb-2">
              接下来的几分钟
            </h2>
            <p className="text-sm text-ink-light leading-relaxed">
              你将阅读 27 段描述，凭直觉选择最贴近你真实感受的那个选项。不需要深思熟虑，相信你的第一反应。
            </p>
          </div>
        </div>

        {/* 温柔提示 */}
        <div className="flex justify-center gap-8 text-xs text-ink-muted mb-8">
          <span>约 5-8 分钟</span>
          <span>凭直觉作答</span>
          <span>没有对错之分</span>
        </div>

        {/* 开始按钮 */}
        <button
          onClick={() => setStarted(true)}
          className="group relative px-10 py-4 rounded-full text-base font-medium text-cream-warm bg-sage-600 hover:bg-sage-700 active:bg-sage-500 transition-all duration-300 focus-soft"
        >
          <span className="relative z-10">开始探索</span>
        </button>

        {/* 底部留白与免责声明 */}
        <p className="mt-12 text-xs text-ink-faint max-w-xs mx-auto leading-relaxed">
          基于 Elaine N. Aron 博士的标准化量表 · 仅供自我了解与参考，不构成临床诊断
        </p>
      </div>
    </div>
  );
}
