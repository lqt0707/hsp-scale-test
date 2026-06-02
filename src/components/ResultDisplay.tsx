'use client';

import { useSyncExternalStore, useState } from 'react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  calculateScore,
  getCategoryDescription,
  getScoreDistribution,
  type ScoreResult,
} from '@/utils/scoring';
import AIAnalysis from './AIAnalysis';
import ExportModal from './ExportModal';

// 模块级缓存，确保 getSnapshot 返回稳定引用
let cachedResult: ScoreResult | null | undefined;

function getSnapshot(): ScoreResult | null {
  if (cachedResult === undefined) {
    const raw = sessionStorage.getItem('hsp-answers');
    cachedResult = raw ? calculateScore(JSON.parse(raw)) : null;
  }
  return cachedResult;
}

function getServerSnapshot(): ScoreResult | null {
  return null;
}

const CATEGORY_GREETING: Record<string, string> = {
  low: '你拥有一颗沉稳而从容的心',
  moderate: '你在敏感与从容之间找到了平衡',
  high: '你拥有一颗细腻而深邃的心灵',
  veryHigh: '你拥有极其丰富而深刻的内在世界',
};

const noopSubscribe = () => () => {};

export default function ResultDisplay() {
  const scoreResult = useSyncExternalStore(noopSubscribe, getSnapshot, getServerSnapshot);
  const [showExport, setShowExport] = useState(false);

  const description = scoreResult ? getCategoryDescription(scoreResult.category) : null;

  if (!scoreResult || !description) {
    return (
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-ink-muted">未找到测试数据</p>
        <Link
          href="/"
          className="px-6 py-3 text-sm text-sage-600 hover:text-sage-700 transition-colors focus-soft"
        >
          返回首页
        </Link>
      </div>
    );
  }

  const distributionData = getScoreDistribution();
  const userBarIndex = getUserBarIndex(scoreResult.totalScore, distributionData);

  const radarData = [
    { dimension: '感觉敏感性', score: scoreResult.dimensionScores.sensorySensitivity },
    { dimension: '情绪反应', score: scoreResult.dimensionScores.emotionalReactivity },
    { dimension: '审美敏感性', score: scoreResult.dimensionScores.aestheticSensitivity },
  ];

  const greeting = CATEGORY_GREETING[scoreResult.category] || '';

  return (
    <div className="relative z-10 min-h-screen pb-16">
      {/* 头部 */}
      <div className="px-6 pt-16 pb-10 text-center animate-fade-up">
        {/* 叶子装饰 */}
        <div className="mb-6">
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none" className="mx-auto">
            <path
              d="M24 4C24 4 12 12 8 24C4 36 12 44 24 44C24 44 24 28 24 4Z"
              fill="currentColor" className="text-sage-300" opacity="0.5"
            />
            <path
              d="M24 4C24 4 36 12 40 24C44 36 36 44 24 44C24 44 24 28 24 4Z"
              fill="currentColor" className="text-sage-400" opacity="0.4"
            />
          </svg>
        </div>

        <p className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-medium text-ink mb-3 leading-snug">
          {greeting}
        </p>
        <p className="text-sm text-ink-muted">
          以下是根据你的回答生成的个人画像
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-6 space-y-6">
        {/* 核心分数 — 温暖展示 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-8 text-center animate-fade-up">
          <p className="text-xs text-ink-faint tracking-wide mb-2 uppercase">敏感性指数</p>
          <div className="font-[family-name:var(--font-display)] text-5xl font-semibold text-sage-600 mb-2">
            {scoreResult.meanScore.toFixed(1)}
            <span className="text-2xl text-ink-faint font-normal"> / 7</span>
          </div>
          <span className="inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-medium bg-sage-100 text-sage-700 border border-sage-200">
            {description.title}
          </span>
        </div>

        {/* 百分位 — 柔和展示 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-8 text-center">
          <p className="text-xs text-ink-faint tracking-wide mb-3">在人群中的位置</p>
          <p className="font-[family-name:var(--font-display)] text-3xl font-medium text-ink">
            高于 <span className="text-sage-600">{scoreResult.percentile}%</span> 的人
          </p>
          <p className="text-xs text-ink-faint mt-2">
            基于 HSP 量表常模数据估算
          </p>
        </div>

        {/* 分数分布图 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink mb-5">
            人群分布
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={distributionData} margin={{ top: 10, right: 5, left: -20, bottom: 20 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A9285' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#B8BDB4' }} axisLine={false} tickLine={false} unit="%" />
              <Tooltip
                formatter={(value) => [`${value}%`, '占比']}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #EDE8DF',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(8px)',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
                {distributionData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={index === userBarIndex ? '#7D9A6A' : '#E2E8DC'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-center text-xs text-sage-600 mt-2">
            深色区域代表你所在的区间
          </p>
        </div>

        {/* 维度雷达图 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink mb-5">
            你的三个维度
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} outerRadius="65%">
              <PolarGrid stroke="#E2E8DC" />
              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#5A6355' }} />
              <PolarRadiusAxis domain={[0, 7]} tick={{ fontSize: 9, fill: '#B8BDB4' }} axisLine={false} />
              <Radar
                name="得分"
                dataKey="score"
                stroke="#7D9A6A"
                fill="#A3B895"
                fillOpacity={0.2}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {radarData.map((item) => (
              <div key={item.dimension} className="text-center">
                <p className="text-xs text-ink-muted mb-1">{item.dimension}</p>
                <p className="font-[family-name:var(--font-display)] text-xl font-medium text-sage-600">
                  {item.score.toFixed(1)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 性格特征 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink mb-4">
            你的特质
          </h2>
          <div className="space-y-3">
            {description.traits.map((trait, i) => (
              <div key={i} className="flex gap-3 text-sm text-ink-light leading-relaxed">
                <span className="text-sage-400 mt-1 text-xs flex-shrink-0">&#9679;</span>
                {trait}
              </div>
            ))}
          </div>
        </div>

        {/* 优势 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink mb-4">
            你的光芒
          </h2>
          <div className="space-y-3">
            {description.strengths.map((item, i) => (
              <div key={i} className="flex gap-3 text-sm text-ink-light leading-relaxed">
                <span className="text-sage-400 mt-0.5 flex-shrink-0">&#10003;</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* 挑战 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-parchment p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink mb-4">
            也许你曾感到
          </h2>
          <div className="space-y-3">
            {description.challenges.map((item, i) => (
              <div key={i} className="flex gap-3 text-sm text-ink-light leading-relaxed">
                <span className="text-earth-400 mt-1 text-xs flex-shrink-0">&#9679;</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* 建议 */}
        <div className="bg-sage-50/80 backdrop-blur-sm rounded-3xl border border-sage-100 p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-sage-700 mb-4">
            给自己的一些温柔
          </h2>
          <div className="space-y-3">
            {description.suggestions.map((item, i) => (
              <div key={i} className="flex gap-3 text-sm text-sage-700 leading-relaxed">
                <span className="text-sage-400 mt-0.5 flex-shrink-0 text-xs">{i + 1}.</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* AI 深度分析 */}
        <AIAnalysis scoreResult={scoreResult} />

        {/* 温暖结语 */}
        <div className="text-center py-8">
          <p className="font-[family-name:var(--font-display)] text-base text-ink-light italic leading-relaxed max-w-md mx-auto mb-6">
            &ldquo;敏感不是弱点，而是一种更深层感知世界的方式。每一种敏感性都有其独特的美。&rdquo;
          </p>
        </div>

        {/* 导出报告 */}
        <div className="text-center pb-4">
          <button
            onClick={() => setShowExport(true)}
            className="px-8 py-3 text-sm font-medium text-sage-600 hover:text-sage-700 border border-sage-200 hover:border-sage-300 rounded-full transition-all duration-300 focus-soft"
          >
            导出报告
          </button>
        </div>

        {/* 免责 */}
        <div className="text-center text-xs text-ink-faint space-y-1 pb-4">
          <p>本测试仅供自我了解与参考，不构成临床诊断</p>
          <p>如需专业评估，请咨询心理健康专业人士</p>
          <p className="mt-2">量表来源：Aron, E.N. & Aron, A. (1997)</p>
        </div>

        {/* 重新测试 */}
        <div className="text-center pb-10">
          <Link
            href="/"
            className="inline-block px-8 py-3 text-sm text-sage-600 hover:text-sage-700 border border-sage-200 hover:border-sage-300 rounded-full transition-all duration-300 focus-soft"
          >
            重新探索
          </Link>
        </div>
      </div>

      {showExport && (
        <ExportModal
          scoreResult={scoreResult}
          description={description}
          aiContent={
            typeof window !== 'undefined'
              ? sessionStorage.getItem('hsp-ai-analysis') ?? undefined
              : undefined
          }
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

function getUserBarIndex(
  totalScore: number,
  distribution: ReturnType<typeof getScoreDistribution>
): number {
  for (let i = 0; i < distribution.length; i++) {
    const [low, high] = distribution[i].range.split('-').map(Number);
    if (totalScore >= low && totalScore <= high) return i;
  }
  return distribution.length - 1;
}
