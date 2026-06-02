import questions from '@/data/hsp-questions.json';

export type SensitivityCategory = 'low' | 'moderate' | 'high' | 'veryHigh';

export interface ScoreResult {
  totalScore: number;
  meanScore: number;
  maxPossible: number;
  minPossible: number;
  percentile: number;
  category: SensitivityCategory;
  categoryLabel: string;
  dimensionScores: {
    sensorySensitivity: number;
    emotionalReactivity: number;
    aestheticSensitivity: number;
  };
}

export interface CategoryDescription {
  title: string;
  percentage: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  suggestions: string[];
}

/**
 * 计算 HSP 量表得分
 * @param answers 用户作答数组，索引对应题目 id-1，值为 1-7
 */
export function calculateScore(answers: number[]): ScoreResult {
  const items = questions.questions;
  let totalScore = 0;
  const dimSums: Record<string, number[]> = {
    sensorySensitivity: [],
    emotionalReactivity: [],
    aestheticSensitivity: [],
  };

  items.forEach((item, index) => {
    const rawAnswer = answers[index];
    const score = item.reverseScored ? (8 - rawAnswer) : rawAnswer;
    totalScore += score;
    if (dimSums[item.dimension]) {
      dimSums[item.dimension].push(score);
    }
  });

  const meanScore = totalScore / items.length;
  const percentile = getPercentile(meanScore);
  const { category, label } = getResultCategory(meanScore);

  const dimensionScores = {
    sensorySensitivity: avg(dimSums.sensorySensitivity),
    emotionalReactivity: avg(dimSums.emotionalReactivity),
    aestheticSensitivity: avg(dimSums.aestheticSensitivity),
  };

  return {
    totalScore,
    meanScore: Math.round(meanScore * 100) / 100,
    maxPossible: items.length * 7,
    minPossible: items.length,
    percentile,
    category,
    categoryLabel: label,
    dimensionScores,
  };
}

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100;
}

/**
 * 基于 Aron 研究数据估算百分位排名
 * 研究表明 HSP 均值约 4.2，标准差约 1.1，高敏感人群约占 15-20%
 */
function getPercentile(meanScore: number): number {
  // 基于正态分布近似，均值 4.2，标准差 1.1
  const z = (meanScore - 4.2) / 1.1;
  // 使用简化的标准正态累积分布函数近似
  const percentile = standardNormalCDF(z) * 100;
  return Math.round(Math.min(99, Math.max(1, percentile)));
}

function standardNormalCDF(x: number): number {
  // Abramowitz & Stegun 近似公式
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX / 2);

  return 0.5 * (1.0 + sign * y);
}

/**
 * 根据均分判定敏感性分类
 */
function getResultCategory(meanScore: number): { category: SensitivityCategory; label: string } {
  if (meanScore < 3.5) {
    return { category: 'low', label: '低敏感型' };
  } else if (meanScore < 4.5) {
    return { category: 'moderate', label: '中等敏感型' };
  } else if (meanScore < 5.5) {
    return { category: 'high', label: '高敏感型' };
  } else {
    return { category: 'veryHigh', label: '极高敏感型' };
  }
}

/**
 * 获取各分类的详细描述
 */
export function getCategoryDescription(category: SensitivityCategory): CategoryDescription {
  const descriptions: Record<SensitivityCategory, CategoryDescription> = {
    low: {
      title: '低敏感型',
      percentage: '约 15-20% 的人群属于此类型',
      traits: [
        '对外界刺激的反应较为平稳，不容易被环境干扰',
        '在嘈杂或繁忙的环境中也能保持较好的专注力',
        '情绪波动相对较小，恢复速度较快',
        '对细节和微妙变化的感知不如高敏感人群敏锐',
      ],
      strengths: [
        '抗压能力强，适合高压工作环境',
        '决策果断，不容易过度分析',
        '社交场合中表现自如',
        '能快速适应新环境和变化',
      ],
      challenges: [
        '可能忽略他人微妙的情绪信号',
        '有时会错过环境中的重要细节',
        '可能被他人认为不够细腻或共情',
      ],
      suggestions: [
        '练习倾听他人的感受和需求',
        '在重要决策时，刻意关注细节信息',
        '适当发展对艺术和美感的欣赏能力',
      ],
    },
    moderate: {
      title: '中等敏感型',
      percentage: '约 30-40% 的人群属于此类型',
      traits: [
        '对外界刺激的反应处于中等水平',
        '能在大多数情况下保持良好的平衡',
        '有时会注意到细节，但不会过度沉浸',
        '情绪反应适中，能较好地自我调节',
      ],
      strengths: [
        '兼具感性与理性，适应性强',
        '能在需要细致观察和快速行动间灵活切换',
        '人际交往中既能共情又不过度卷入',
        '对刺激的管理能力较好',
      ],
      challenges: [
        '在极端环境下可能会感到不适',
        '有时可能在敏感和钝感之间摇摆',
        '可能需要有意识地管理能量消耗',
      ],
      suggestions: [
        '了解自己的能量阈值，适时休息',
        '培养正念或冥想习惯以增强自我觉察',
        '根据当天状态灵活安排社交和活动强度',
      ],
    },
    high: {
      title: '高敏感型 (HSP)',
      percentage: '约 15-20% 的人群属于此类型',
      traits: [
        '对感官刺激（声音、光线、气味、触感）高度敏感',
        '能深刻感知他人情绪，共情能力强',
        '对艺术、美感和微妙事物有深刻体验',
        '倾向于深度思考和处理信息',
        '容易在刺激过多时感到疲劳',
      ],
      strengths: [
        '出色的观察力和洞察力',
        '强大的共情能力，是优秀的倾听者',
        '创造力和审美能力突出',
        '能发现他人容易忽略的重要细节',
        '直觉敏锐，决策考虑周全',
      ],
      challenges: [
        '容易在嘈杂、繁忙的环境中感到不堪重负',
        '可能需要更多的独处时间来恢复精力',
        '对他人的负面情绪容易"感同身受"',
        '在压力下可能出现过度刺激反应',
      ],
      suggestions: [
        '建立规律的个人恢复时间（如散步、冥想、独处）',
        '学会设立健康的情绪边界',
        '创造安静、舒适的个人空间',
        '了解并接受自己的敏感特质，这是一份天赋',
        '参考 Elaine Aron 博士的著作《高敏感人群》深入了解自我',
      ],
    },
    veryHigh: {
      title: '极高敏感型',
      percentage: '约 5-10% 的人群属于此类型',
      traits: [
        '对外界几乎所有刺激都有强烈感知',
        '情绪体验极其丰富和深刻',
        '对环境和他人情绪的变化几乎"感同身受"',
        '需要大量独处时间来处理信息和恢复精力',
        '可能经常感到与周围世界"不同步"',
      ],
      strengths: [
        '超凡的直觉和洞察力',
        '极深的共情能力和人际连接',
        '出色的创造性思维和艺术天赋',
        '能感知到极其微妙的人际和环境动态',
        '深刻的自我觉察和内省能力',
      ],
      challenges: [
        '日常生活中容易感到过度刺激和疲惫',
        '社交场合可能需要大量能量',
        '可能经历强烈的情绪波动',
        '在现代快节奏社会中可能感到格格不入',
      ],
      suggestions: [
        '优先照顾自己的神经系统：规律休息、减少刺激',
        '寻求专业心理咨询支持，了解如何与敏感特质共处',
        '寻找志同道合的社群，减少孤立感',
        '将敏感特质转化为职业优势（如艺术、咨询、研究等领域）',
        '建立严格的个人边界，学会说"不"',
        '每天安排固定的"减压仪式"（如自然接触、音乐、写作）',
      ],
    },
  };

  return descriptions[category];
}

/**
 * 获取分数区间分布数据（用于图表展示）
 */
export function getScoreDistribution() {
  return [
    { range: '27-62', label: '低敏感', midPoint: 44.5, percentage: 18, color: '#94a3b8' },
    { range: '63-94', label: '中等偏低', midPoint: 78.5, percentage: 22, color: '#60a5fa' },
    { range: '95-121', label: '中等敏感', midPoint: 108, percentage: 25, color: '#a78bfa' },
    { range: '122-148', label: '中等偏高', midPoint: 135, percentage: 20, color: '#f472b6' },
    { range: '149-189', label: '高敏感', midPoint: 169, percentage: 15, color: '#fb923c' },
  ];
}
