import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, language } = await request.json();
    const cleanText = String(text ?? '').trim().slice(0, 1200);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey || !cleanText) {
      return NextResponse.json({ available: false });
    }

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-tts',
        voice: process.env.OPENAI_TTS_VOICE || 'coral',
        input: cleanText,
        instructions: language === 'hi'
          ? 'Speak natural, warm Hindi with an Indian conversational tone. Sound like a friendly young Indian woman helping an elderly citizen. Calm, clear, reassuring, not robotic.'
          : 'Speak natural Indian English with a warm, friendly young Indian woman voice. Calm, clear, reassuring, conversational, not robotic.',
        response_format: 'mp3',
      }),
    });

    if (!response.ok) return NextResponse.json({ available: false });

    const audio = await response.arrayBuffer();
    return new Response(audio, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    });
  } catch {
    return NextResponse.json({ available: false });
  }
}
