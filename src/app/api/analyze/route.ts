import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ScoreResult } from '@/utils/scoring';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

function buildPrompt(scoreResult: ScoreResult): string {
  return `你是一位温和专业的心理咨询师，擅长帮助人们理解自己的敏感性特质。

请基于以下 HSP（高敏感人格量表）测试结果，为用户提供个性化的深度分析。

## 用户测试数据
- 总分：${scoreResult.totalScore} / ${scoreResult.maxPossible}
- 均分：${scoreResult.meanScore} / 7
- 敏感性分类：${scoreResult.categoryLabel}
- 百分位排名：高于 ${scoreResult.percentile}% 的人
- 感觉敏感性维度：${scoreResult.dimensionScores.sensorySensitivity} / 7
- 情绪反应维度：${scoreResult.dimensionScores.emotionalReactivity} / 7
- 审美敏感性维度：${scoreResult.dimensionScores.aestheticSensitivity} / 7

## 分析要求
1. 请用温暖、肯定、非临床化的语气
2. 基于具体数据做个性化分析，避免泛泛而谈
3. 关注用户三个维度的得分差异，分析其含义
4. 提供 2-3 条与用户具体情况相关的实用建议
5. 以鼓励和肯定作为结尾

## 输出结构
请按以下结构组织你的分析：

### 核心解读
（基于总分和分类的整体分析）

### 维度画像
（分析三个维度得分的差异和含义）

### 生活建议
（2-3 条针对性建议）`;
}

export async function POST(request: Request) {
  try {
    const { scoreResult } = await request.json() as { scoreResult: ScoreResult };

    if (!scoreResult) {
      return NextResponse.json(
        { error: '缺少测试数据' },
        { status: 400 }
      );
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'API Key 未配置，请在 .env.local 中设置 DEEPSEEK_API_KEY' },
        { status: 500 }
      );
    }

    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是一位温暖专业的心理咨询师，擅长帮助人们理解自己的敏感性特质。请用中文回答，语气温暖、肯定、非临床化。',
        },
        {
          role: 'user',
          content: buildPrompt(scoreResult),
        },
      ],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI 分析错误:', error);
    return NextResponse.json(
      { error: '生成分析时出错，请稍后重试' },
      { status: 500 }
    );
  }
}
