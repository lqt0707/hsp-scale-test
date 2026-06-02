'use client';

import { useState, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import type { ScoreResult, CategoryDescription } from '@/utils/scoring';
import ExportContent, { type ModuleId } from './ExportContent';
import { exportAsImage, exportAsPDF } from '@/utils/export';

interface ExportModalProps {
  scoreResult: ScoreResult;
  description: CategoryDescription;
  aiContent?: string;
  onClose: () => void;
}

type ExportFormat = 'pdf' | 'png';

interface ModuleConfig {
  id: ModuleId;
  label: string;
  defaultChecked: boolean;
}

const MODULES: ModuleConfig[] = [
  { id: 'score', label: '核心分数与分类', defaultChecked: true },
  { id: 'percentile', label: '百分位排名', defaultChecked: true },
  { id: 'radar', label: '维度分数', defaultChecked: true },
  { id: 'traits', label: '性格特征', defaultChecked: true },
  { id: 'strengths', label: '优势', defaultChecked: true },
  { id: 'challenges', label: '挑战', defaultChecked: false },
  { id: 'suggestions', label: '建议', defaultChecked: false },
  { id: 'aiAnalysis', label: 'AI 深度分析', defaultChecked: false },
];

export default function ExportModal({
  scoreResult,
  description,
  aiContent,
  onClose,
}: ExportModalProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [selectedModules, setSelectedModules] = useState<Set<ModuleId>>(
    () => {
      const initial = new Set(MODULES.filter((m) => m.defaultChecked).map((m) => m.id));
      if (aiContent) initial.add('aiAnalysis');
      return initial;
    }
  );
  const [exporting, setExporting] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const toggleModule = (id: ModuleId) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = useCallback(async () => {
    if (selectedModules.size === 0) return;
    setExporting(true);

    try {
      // 创建隐藏容器
      const container = document.createElement('div');
      container.style.position = 'fixed';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // 用 React 渲染 ExportContent 到容器
      const root = createRoot(container);

      await new Promise<void>((resolve) => {
        root.render(
          <ExportContent
            scoreResult={scoreResult}
            description={description}
            selectedModules={selectedModules}
            aiContent={aiContent}
          />
        );
        // 等待一帧确保渲染完成
        requestAnimationFrame(() => resolve());
      });

      const element = container.firstElementChild as HTMLElement;

      if (format === 'png') {
        await exportAsImage(element, `HSP-报告-${formatDate()}`);
      } else {
        await exportAsPDF(element, `HSP-报告-${formatDate()}`);
      }

      // 清理
      root.unmount();
      document.body.removeChild(container);
    } catch (err) {
      console.error('导出失败:', err);
    } finally {
      setExporting(false);
    }
  }, [scoreResult, description, selectedModules, aiContent, format]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current && !exporting) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
    >
      <div className="bg-cream rounded-3xl border border-parchment p-6 sm:p-8 w-full max-w-md animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-medium text-ink">
            导出报告
          </h2>
          <button
            onClick={onClose}
            disabled={exporting}
            className="text-ink-muted hover:text-ink transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* 格式选择 */}
        <div className="mb-5">
          <p className="text-xs text-ink-faint mb-2">导出格式</p>
          <div className="flex gap-2">
            <button
              onClick={() => setFormat('pdf')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                format === 'pdf'
                  ? 'bg-sage-100 border-sage-400 text-sage-700'
                  : 'bg-white border-parchment text-ink-muted hover:border-sage-200'
              }`}
            >
              PDF 文档
            </button>
            <button
              onClick={() => setFormat('png')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                format === 'png'
                  ? 'bg-sage-100 border-sage-400 text-sage-700'
                  : 'bg-white border-parchment text-ink-muted hover:border-sage-200'
              }`}
            >
              PNG 图片
            </button>
          </div>
        </div>

        {/* 模块选择 */}
        <div className="mb-6">
          <p className="text-xs text-ink-faint mb-2">包含内容</p>
          <div className="space-y-1.5">
            {MODULES.map((mod) => {
              if (mod.id === 'aiAnalysis' && !aiContent) return null;
              const isChecked = selectedModules.has(mod.id);
              return (
                <label
                  key={mod.id}
                  className="flex items-center gap-3 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-sage-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleModule(mod.id)}
                    className="w-4 h-4 rounded border-sage-300 text-sage-600 focus:ring-sage-400 accent-sage-600"
                  />
                  <span className="text-sm text-ink-light">{mod.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 导出按钮 */}
        <button
          onClick={handleExport}
          disabled={exporting || selectedModules.size === 0}
          className="w-full py-3 rounded-full text-sm font-medium text-cream-warm bg-sage-600 hover:bg-sage-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {exporting ? '正在生成...' : `导出 ${format.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}

function formatDate(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}
