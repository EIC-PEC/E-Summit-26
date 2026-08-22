import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const lastUserMessage = [...(body.messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '';

    const groqApiKey = process.env.GROQ_API_KEY;
    if (groqApiKey && groqApiKey.startsWith('gsk_')) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqApiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are the official PEC E-Summit 2026 Admin & Operations Assistant. Provide concise, helpful operational answers about gate check-in, pitch judging, startup expo, and schedule management.',
            },
            ...(body.messages || []),
          ],
          temperature: 0.5,
          max_tokens: 512,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          text: data.choices?.[0]?.message?.content || 'Operational task recorded.',
        });
      }
    }

    return NextResponse.json({
      text: `PEC E-Summit 2026 Operations Assistant: Handled query "${lastUserMessage}". Check the Dashboard or Delegates tab for live updates.`,
    });
  } catch (err: any) {
    return NextResponse.json({
      text: 'PEC E-Summit Operations Assistant active.',
    });
  }
}
