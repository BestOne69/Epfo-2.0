import { NextResponse } from 'next/server';

const fallback = (message: string, language: 'en' | 'hi') => {
  const q = message.toLowerCase();
  if (language === 'hi') {
    if (/mismatch|नाम|आधार|uan/.test(q)) return 'पहले अपने डेमो रिकॉर्ड का नाम मिलान करें। Mismatch Check खोलें और Aadhaar, UAN और बैंक रिकॉर्ड की तुलना करें।';
    if (/grievance|शिकायत|pending|escalat|अटका/.test(q)) return 'आपका सिंथेटिक डेमो grievance 34 दिनों से लंबित है। आप इसका follow-up escalation तैयार कर सकते हैं।';
    if (/passbook|pension|eps|balance|बैलेंस|पेंशन/.test(q)) return 'PF balance में employee share, employer share और interest शामिल हैं। EPS आपकी pension component है और इसे उसी withdrawable PF balance में नहीं जोड़ना चाहिए।';
    return 'आपका डेमो claim अभी review में है। फिलहाल आपकी ओर से कोई कार्रवाई जरूरी नहीं है।';
  }
  if (/mismatch|name|aadhaar|uan/.test(q)) return 'Let’s check the demo records before a claim starts. Open Mismatch Check and compare the synthetic Aadhaar, UAN and bank names.';
  if (/grievance|pending|escalat|stuck/.test(q)) return 'Your synthetic grievance has waited 34 days, beyond our illustrative demo threshold. I can help prepare a follow-up escalation.';
  if (/passbook|pension|eps|balance/.test(q)) return 'Your withdrawable PF is employee share + employer share + interest. EPS is your pension component and should be kept separate from that balance.';
  return 'Your demo claim is currently being reviewed. Nothing is needed from you right now. I can explain the status, check a mismatch, explain your passbook, or help with a grievance.';
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = String(body?.message ?? '').trim();
    const language: 'en' | 'hi' = body?.language === 'hi' ? 'hi' : 'en';
    const history = Array.isArray(body?.history) ? body.history.slice(-8) : [];

    if (!message) return NextResponse.json({ reply: fallback('', language), fallback: true });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ reply: fallback(message, language), fallback: true });

    const model = process.env.OPENAI_MODEL || 'gpt-5.6';
    const system = language === 'hi'
      ? 'You are PF Saathi, a warm bilingual civic-tech companion. Reply in simple Hindi unless the user uses English. This is an independent hackathon prototype, not EPFO or government. Use only synthetic demo facts: claim under review, 34-day stalled grievance, mismatch checking, and PF versus EPS explanation. Never ask for or encourage real Aadhaar, PAN, UAN, bank numbers, OTPs, passwords, or documents. Keep answers short, practical, reassuring, and easy for an elderly user to understand. If asked about live EPFO data, say you cannot access it.'
      : 'You are PF Saathi, a warm bilingual civic-tech companion. Reply in plain English. This is an independent hackathon prototype, not EPFO or government. Use only synthetic demo facts: claim under review, 34-day stalled grievance, mismatch checking, and PF versus EPS explanation. Never ask for or encourage real Aadhaar, PAN, UAN, bank numbers, OTPs, passwords, or documents. Keep answers short, practical, reassuring, and easy for an elderly user to understand. If asked about live EPFO data, say you cannot access it.';

    const input = [
      { role: 'system', content: system },
      ...history.map((item: { role?: string; text?: string }) => ({
        role: item.role === 'assistant' ? 'assistant' : 'user',
        content: String(item.text ?? '').slice(0, 800),
      })),
      { role: 'user', content: message.slice(0, 1200) },
    ];

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, input, max_output_tokens: 220 }),
    });

    if (!response.ok) return NextResponse.json({ reply: fallback(message, language), fallback: true });

    const data = await response.json();
    const reply = typeof data?.output_text === 'string' ? data.output_text.trim() : '';
    if (!reply) return NextResponse.json({ reply: fallback(message, language), fallback: true });

    return NextResponse.json({ reply, fallback: false });
  } catch {
    return NextResponse.json({ reply: fallback('', 'en'), fallback: true });
  }
}
