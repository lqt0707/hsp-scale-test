# HSP Scale Test — 高敏感人格量表在线测试

A gentle, beautifully crafted online self-assessment tool based on **Dr. Elaine N. Aron's 27-item Highly Sensitive Person (HSP) Scale**. Built with Next.js, featuring AI-powered deep analysis and report export.

基于 **Elaine N. Aron 博士的 27 题高敏感量表**，一款设计温柔的在线自我评估工具。支持 AI 深度分析、报告导出。使用 Next.js 构建。

## Features / 功能

- ✅ **Standardized HSP Scale** — All 27 items with 7-point Likert scale, including reverse scoring and 3 subdimensions
- ✅ **3 Subdimensions** — Sensory Sensitivity, Emotional Reactivity, Aesthetic Sensitivity
- ✅ **AI Deep Analysis** — Powered by DeepSeek API, provides personalized interpretation based on your scores
- ✅ **Report Export** — Export full analysis as PDF or image
- ✅ **Beautiful UI** — Gentle, nature-inspired design with calming aesthetics
- ✅ **Fully Responsive** — Works on desktop and mobile

## Tech Stack / 技术栈

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Fonts | Fraunces (display) + DM Sans (body) |
| Charts | Recharts |
| AI API | DeepSeek (OpenAI-compatible) |
| Export | html2canvas-pro + jsPDF |

## Getting Started / 快速开始

### Prerequisites / 前置要求

- Node.js >= 18
- DeepSeek API key (optional, for AI analysis)

### Installation

```bash
git clone https://github.com/<your-username>/hsp-scale-test.git
cd hsp-scale-test
npm install
```

### Configuration

Copy `.env.example` to `.env.local` and add your DeepSeek API key:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
DEEPSEEK_API_KEY=sk-your-api-key-here
```

> The app works without an API key — AI analysis will be unavailable, but the test itself functions fully.

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure / 项目结构

```
src/
├── app/
│   ├── api/analyze/     # AI analysis API route
│   ├── result/          # Results page
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Landing page
├── components/
│   ├── AIAnalysis.tsx   # AI analysis display
│   ├── ExportContent.tsx
│   ├── ExportModal.tsx
│   ├── HSPTest.tsx      # Main test component
│   ├── ProgressBar.tsx
│   ├── QuestionCard.tsx
│   └── ResultDisplay.tsx
├── data/
│   └── hsp-questions.json  # All 27 questions & metadata
└── utils/
    ├── export.ts        # PDF/image export utilities
    └── scoring.ts       # Scoring & dimension calculation
```

## Scoring / 计分说明

- **Total score range**: 27–189
- **Cutoff**: ≥ 132 suggests high sensitivity (per Aron's research)
- **3 dimensions**: Sensory Sensitivity, Emotional Reactivity, Aesthetic Sensitivity
- Some items are **reverse-scored**

See `src/utils/scoring.ts` and `src/data/hsp-questions.json` for details.

## License / 许可

[MIT](LICENSE) © 2025

## Disclaimer / 免责声明

This tool is for **self-understanding and educational purposes only**. It does **not** constitute a clinical diagnosis. If you have concerns about your mental health, please consult a qualified professional.

本工具仅供**自我了解与教育参考**，不构成临床诊断。如有心理健康方面的疑虑，请咨询专业人士。
