'use client';

import { useState, useCallback } from 'react';
import type { ScoreResult } from '@/utils/scoring';

interface AIAnalysisProps {
  scoreResult: ScoreResult;
}

type AnalysisState = 'idle' | 'loading' | 'streaming' | 'done' | 'error';

export default function AIAnalysis({ scoreResult }: AIAnalysisProps) {
  const [state, setState] = useState<AnalysisState>('idle');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const fetchAnalysis = useCallback(async () => {
    setState('loading');
    setContent('');
    setError('');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scoreResult }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');

      setState('streaming');
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        fullContent += text;
        setContent((prev) => prev + text);
      }

      // 缓存到 sessionStorage，供导出功能使用
      try {
        sessionStorage.setItem('hsp-ai-analysis', fullContent);
      } catch { /* ignore */ }

      setState('done');
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : '生成分析时出错');
    }
  }, [scoreResult]);

  if (state === 'idle') {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-6 sm:p-8 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink mb-3">
          想要更深入的了解？
        </h2>
        <p className="text-sm text-ink-muted mb-5">
          AI 将根据你的具体回答，生成个性化的深度分析
        </p>
        <button
          onClick={fetchAnalysis}
          className="px-6 py-3 text-sm font-medium text-cream-warm bg-sage-600 hover:bg-sage-700 rounded-full transition-all duration-300 focus-soft"
        >
          获取 AI 深度分析
        </button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-earth-300/30 p-6 sm:p-8">
        <p className="text-sm text-earth-500 mb-4">{error}</p>
        <button
          onClick={fetchAnalysis}
          className="text-sm text-sage-600 hover:text-sage-700 underline underline-offset-2 focus-soft"
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-6 sm:p-8">
      <div className="flex items-center gap-2 mb-5">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
          AI 深度分析
        </h2>
        {state === 'loading' && (
          <span className="text-xs text-ink-muted animate-breathe">
            正在为你生成分析...
          </span>
        )}
        {state === 'streaming' && (
          <span className="w-2 h-4 bg-sage-500 animate-pulse rounded-sm" />
        )}
      </div>

      {state === 'loading' && !content && (
        <div className="space-y-3">
          <div className="h-4 bg-parchment rounded-full w-3/4 animate-pulse" />
          <div className="h-4 bg-parchment rounded-full w-1/2 animate-pulse" />
          <div className="h-4 bg-parchment rounded-full w-5/6 animate-pulse" />
        </div>
      )}

      {content && (
        <div className="prose prose-sm prose-slate max-w-none">
          {renderMarkdown(content)}
        </div>
      )}

      {state === 'done' && (
        <div className="mt-6 pt-4 border-t border-parchment">
          <p className="text-xs text-ink-faint">
            此分析由 AI 生成，仅供参考。如有需要，请咨询专业心理健康人士。
          </p>
        </div>
      )}
    </div>
  );
}

function renderInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // 匹配 **bold**, *italic*, `code`, ***bold-italic***
  const regex = /(\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // 前面的普通文本
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // ***bold-italic***
      parts.push(<strong key={parts.length}><em>{match[2]}</em></strong>);
    } else if (match[3]) {
      // **bold**
      parts.push(<strong key={parts.length}>{match[3]}</strong>);
    } else if (match[4]) {
      // *italic*
      parts.push(<em key={parts.length}>{match[4]}</em>);
    } else if (match[5]) {
      // `code`
      parts.push(
        <code key={parts.length} className="bg-parchment px-1 py-0.5 rounded text-xs font-mono text-ink">
          {match[5]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // 剩余的普通文本
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={elements.length} className="text-sm text-ink-light leading-relaxed mb-3">
          {renderInlineMarkdown(currentParagraph.join(' '))}
        </p>
      );
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('#### ')) {
      flushParagraph();
      elements.push(
        <h4
          key={elements.length}
          className="font-[family-name:var(--font-display)] text-sm font-semibold text-ink mt-4 mb-2"
        >
          {renderInlineMarkdown(trimmed.slice(5))}
        </h4>
      );
    } else if (trimmed.startsWith('### ')) {
      flushParagraph();
      elements.push(
        <h3
          key={elements.length}
          className="font-[family-name:var(--font-display)] text-base font-medium text-ink mt-5 mb-2"
        >
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
    } else if (trimmed.startsWith('## ')) {
      flushParagraph();
      elements.push(
        <h2
          key={elements.length}
          className="font-[family-name:var(--font-display)] text-lg font-medium text-ink mt-6 mb-3"
        >
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
    } else if (trimmed.startsWith('# ')) {
      flushParagraph();
      elements.push(
        <h1
          key={elements.length}
          className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink mt-6 mb-3"
        >
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushParagraph();
      elements.push(
        <li key={elements.length} className="text-sm text-ink-light leading-relaxed ml-4 mb-1.5 list-disc">
          {renderInlineMarkdown(trimmed.slice(2))}
        </li>
      );
    } else if (trimmed.match(/^\d+\.\s/)) {
      flushParagraph();
      const match = trimmed.match(/^\d+\.\s(.*)/);
      elements.push(
        <li key={elements.length} className="text-sm text-ink-light leading-relaxed ml-4 mb-1.5 list-decimal">
          {renderInlineMarkdown(match ? match[1] : trimmed)}
        </li>
      );
    } else if (trimmed.startsWith('> ')) {
      flushParagraph();
      elements.push(
        <blockquote key={elements.length} className="border-l-2 border-sage-300 pl-4 my-3 text-sm text-ink-muted italic">
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
    } else if (trimmed === '') {
      flushParagraph();
    } else {
      currentParagraph.push(trimmed);
    }
  }

  flushParagraph();
  return elements;
}
