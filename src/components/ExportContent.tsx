import type { ScoreResult } from '@/utils/scoring';
import type { CategoryDescription } from '@/utils/scoring';

export type ModuleId =
  | 'score'
  | 'percentile'
  | 'distribution'
  | 'radar'
  | 'traits'
  | 'strengths'
  | 'challenges'
  | 'suggestions'
  | 'aiAnalysis';

interface ExportContentProps {
  scoreResult: ScoreResult;
  description: CategoryDescription;
  selectedModules: Set<ModuleId>;
  aiContent?: string;
}

export default function ExportContent({
  scoreResult,
  description,
  selectedModules,
  aiContent,
}: ExportContentProps) {
  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      style={{
        width: 800,
        padding: 60,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        backgroundColor: '#ffffff',
        color: '#2C3328',
      }}
    >
      {/* 报告头部 */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            color: '#2C3328',
            margin: '0 0 8px',
          }}
        >
          HSP 高敏感人格量表 — 个人报告
        </h1>
        <p style={{ fontSize: 13, color: '#8A9285', margin: 0 }}>
          生成日期：{today}
        </p>
      </div>

      {/* 核心分数 */}
      {selectedModules.has('score') && (
        <Section>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#B8BDB4', letterSpacing: 2, marginBottom: 8 }}>
              敏感性指数
            </p>
            <p style={{ fontSize: 48, fontWeight: 600, color: '#4A6541', margin: '0 0 4px' }}>
              {scoreResult.meanScore.toFixed(1)}
              <span style={{ fontSize: 20, color: '#B8BDB4', fontWeight: 400 }}> / 7</span>
            </p>
            <p style={{ fontSize: 13, color: '#8A9285', margin: '0 0 12px' }}>
              总分 {scoreResult.totalScore} / {scoreResult.maxPossible}
            </p>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 16px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 500,
                backgroundColor: '#E2E8DC',
                color: '#3A4F34',
              }}
            >
              {description.title}
            </span>
          </div>
        </Section>
      )}

      {/* 百分位排名 */}
      {selectedModules.has('percentile') && (
        <Section>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 12, color: '#B8BDB4', letterSpacing: 2, marginBottom: 8 }}>
              在人群中的位置
            </p>
            <p style={{ fontSize: 32, fontWeight: 500, color: '#2C3328', margin: '0 0 4px' }}>
              高于{' '}
              <span style={{ color: '#4A6541' }}>{scoreResult.percentile}%</span>{' '}
              的人
            </p>
            <p style={{ fontSize: 11, color: '#B8BDB4', margin: 0 }}>
              基于 HSP 量表常模数据估算（均值 4.2，标准差 1.1）
            </p>
          </div>
        </Section>
      )}

      {/* 维度分数 */}
      {selectedModules.has('radar') && (
        <Section title="敏感性维度">
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: 20 }}>
            <DimensionBar
              label="感觉敏感性"
              score={scoreResult.dimensionScores.sensorySensitivity}
            />
            <DimensionBar
              label="情绪反应"
              score={scoreResult.dimensionScores.emotionalReactivity}
            />
            <DimensionBar
              label="审美敏感性"
              score={scoreResult.dimensionScores.aestheticSensitivity}
            />
          </div>
        </Section>
      )}

      {/* 性格特征 */}
      {selectedModules.has('traits') && (
        <Section title="你的特质">
          <BulletList items={description.traits} color="#7D9A6A" />
        </Section>
      )}

      {/* 优势 */}
      {selectedModules.has('strengths') && (
        <Section title="你的光芒">
          <BulletList items={description.strengths} color="#7D9A6A" checkmark />
        </Section>
      )}

      {/* 挑战 */}
      {selectedModules.has('challenges') && (
        <Section title="也许你曾感到">
          <BulletList items={description.challenges} color="#C4896E" />
        </Section>
      )}

      {/* 建议 */}
      {selectedModules.has('suggestions') && (
        <Section title="给自己的一些温柔">
          <NumberedList items={description.suggestions} color="#4A6541" />
        </Section>
      )}

      {/* AI 分析 */}
      {selectedModules.has('aiAnalysis') && aiContent && (
        <Section title="AI 深度分析">
          <div
            style={{ fontSize: 13, color: '#5A6355', lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(aiContent) }}
          />
        </Section>
      )}

      {/* 页脚 */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 48,
          paddingTop: 20,
          borderTop: '1px solid #EDE8DF',
        }}
      >
        <p style={{ fontSize: 11, color: '#B8BDB4', margin: '0 0 4px' }}>
          本测试仅供自我了解与参考，不构成临床诊断
        </p>
        <p style={{ fontSize: 11, color: '#B8BDB4', margin: 0 }}>
          量表来源：Aron, E.N. & Aron, A. (1997). Sensory-Processing Sensitivity.
        </p>
      </div>
    </div>
  );
}

/* ---- 子组件 ---- */

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      {title && (
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#2C3328',
            margin: '0 0 16px',
            paddingBottom: 8,
            borderBottom: '1px solid #EDE8DF',
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function DimensionBar({ label, score }: { label: string; score: number }) {
  const pct = (score / 7) * 100;
  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: '#8A9285', margin: '0 0 8px' }}>{label}</p>
      <div
        style={{
          width: '100%',
          height: 8,
          backgroundColor: '#EDE8DF',
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            backgroundColor: '#7D9A6A',
            borderRadius: 4,
          }}
        />
      </div>
      <p style={{ fontSize: 20, fontWeight: 600, color: '#4A6541', margin: '8px 0 0' }}>
        {score.toFixed(1)}
      </p>
    </div>
  );
}

function BulletList({
  items,
  color,
  checkmark,
}: {
  items: string[];
  color: string;
  checkmark?: boolean;
}) {
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: 13,
            color: '#5A6355',
            lineHeight: 1.7,
            paddingLeft: 20,
            position: 'relative',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              color,
              fontSize: checkmark ? 12 : 8,
              top: checkmark ? 4 : 6,
            }}
          >
            {checkmark ? '✓' : '●'}
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function NumberedList({ items, color }: { items: string[]; color: string }) {
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0, counterReset: 'item' }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontSize: 13,
            color: '#5A6355',
            lineHeight: 1.7,
            paddingLeft: 24,
            position: 'relative',
            marginBottom: 6,
          }}
        >
          <span
            style={{
              position: 'absolute',
              left: 0,
              color,
              fontSize: 12,
              fontWeight: 600,
              top: 2,
            }}
          >
            {i + 1}.
          </span>
          {item}
        </li>
      ))}
    </ol>
  );
}

function simpleMarkdownToHtml(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('### '))
        return `<h3 style="font-size:15px;font-weight:600;color:#2C3328;margin:16px 0 8px">${applyInline(trimmed.slice(4))}</h3>`;
      if (trimmed.startsWith('## '))
        return `<h2 style="font-size:16px;font-weight:600;color:#2C3328;margin:20px 0 10px">${applyInline(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith('# '))
        return `<h1 style="font-size:18px;font-weight:600;color:#2C3328;margin:20px 0 10px">${applyInline(trimmed.slice(2))}</h1>`;
      if (trimmed.startsWith('- ') || trimmed.startsWith('* '))
        return `<p style="margin:4px 0;padding-left:16px;font-size:13px;color:#5A6355"><span style="color:#7D9A6A">●</span> ${applyInline(trimmed.slice(2))}</p>`;
      if (trimmed.match(/^\d+\.\s/))
        return `<p style="margin:4px 0;padding-left:16px;font-size:13px;color:#5A6355">${applyInline(trimmed)}</p>`;
      if (trimmed.startsWith('> '))
        return `<blockquote style="border-left:2px solid #A3B895;padding-left:12px;margin:8px 0;color:#8A9285;font-style:italic;font-size:13px">${applyInline(trimmed.slice(2))}</blockquote>`;
      return `<p style="margin:6px 0;font-size:13px;color:#5A6355;line-height:1.7">${applyInline(trimmed)}</p>`;
    })
    .join('');
}

function applyInline(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:#EDE8DF;padding:1px 4px;border-radius:3px;font-size:12px">$1</code>');
}
