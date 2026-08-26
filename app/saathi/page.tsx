'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { SaathiCharacter } from '@/components/assistant/SaathiCharacter';
import { Button } from '@/components/ui/Button';
import { useLanguage } from '@/components/layout/Shell';

type State = 'idle' | 'listening' | 'speaking';
type Line = { from: 'You' | 'PF Saathi'; text: string };

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => any;
    SpeechRecognition?: new () => any;
  }
}

const fallback = (q: string, language: 'en' | 'hi') => {
  const text = q.toLowerCase();
  if (language === 'hi') {
    if (/mismatch|नाम|आधार|uan/.test(text)) return 'पहले अपने डेमो रिकॉर्ड का नाम मिलान करें। Mismatch Check खोलें और Aadhaar, UAN और बैंक रिकॉर्ड की तुलना करें।';
    if (/grievance|शिकायत|pending|escalat|अटका/.test(text)) return 'आपका सिंथेटिक grievance 34 दिनों से लंबित है। मैं आपके लिए follow-up escalation तैयार करने में मदद कर सकता हूँ।';
    if (/passbook|pension|eps|balance|बैलेंस|पेंशन/.test(text)) return 'Withdrawable PF में employee share, employer share और interest शामिल हैं। EPS आपकी pension component है और इसे उसी balance में नहीं जोड़ना चाहिए।';
    return 'आपका डेमो claim अभी review में है। फिलहाल आपकी ओर से कोई कार्रवाई जरूरी नहीं है।';
  }
  if (/mismatch|name|aadhaar|uan/.test(text)) return 'Let’s check the demo records before a claim starts. Open Mismatch Check and compare the synthetic Aadhaar, UAN and bank names.';
  if (/grievance|pending|escalat|stuck/.test(text)) return 'Your synthetic grievance has waited 34 days, beyond our illustrative demo threshold. I can help prepare a follow-up escalation.';
  if (/passbook|pension|eps|balance/.test(text)) return 'Your withdrawable PF is employee share plus employer share plus interest. EPS is your pension component, so it stays separate.';
  return 'Your demo claim is currently being reviewed. Nothing is needed from you right now. I can explain the status, check a mismatch, explain your passbook, or help with a grievance.';
};

export default function Saathi() {
  const { language } = useLanguage();
  const [state, setState] = useState<State>('idle');
  const [text, setText] = useState('');
  const [lines, setLines] = useState<Line[]>([
    { from: 'PF Saathi', text: 'Hi! Ask about your demo claim, a mismatch, or a delayed grievance.' },
  ]);
  const [supported, setSupported] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const recognition = useRef<any>(null);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setSupported(Boolean(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  useEffect(() => {
    setLines((current) => current.length === 1 && current[0].from === 'PF Saathi'
      ? [{ from: 'PF Saathi', text: language === 'hi' ? 'नमस्ते! अपने डेमो claim, mismatch या grievance के बारे में पूछें।' : 'Hi! Ask about your demo claim, a mismatch, or a delayed grievance.' }]
      : current);
  }, [language]);

  const stop = () => {
    recognition.current?.stop();
    window.speechSynthesis?.cancel();
    if (audio.current) {
      audio.current.pause();
      audio.current.currentTime = 0;
      audio.current = null;
    }
    setAiBusy(false);
    setState('idle');
  };

  const browserSpeak = (reply: string) => {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setState('idle');
      return;
    }

    setState('speaking');
    const say = new SpeechSynthesisUtterance(reply);
    say.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((voice) => {
      const langMatch = language === 'hi' ? /hi(-|_)/i.test(voice.lang) : /en-IN/i.test(voice.lang);
      const warmVoice = /google|microsoft|swara|heera|ravi|priya|neerja|aura|female/i.test(voice.name);
      return langMatch && warmVoice;
    }) || voices.find((voice) => language === 'hi' ? /hi(-|_)/i.test(voice.lang) : /en-IN/i.test(voice.lang));
    if (preferred) say.voice = preferred;
    say.rate = language === 'hi' ? 0.92 : 0.94;
    say.pitch = 1.03;
    say.onend = () => setState('idle');
    say.onerror = () => setState('idle');
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(say);
  };

  const speak = async (reply: string) => {
    setState('speaking');
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: reply, language }),
      });
      const type = response.headers.get('content-type') || '';
      if (response.ok && type.includes('audio')) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const player = new Audio(url);
        audio.current = player;
        player.onended = () => {
          URL.revokeObjectURL(url);
          audio.current = null;
          setState('idle');
        };
        player.onerror = () => {
          URL.revokeObjectURL(url);
          audio.current = null;
          browserSpeak(reply);
        };
        await player.play();
        return;
      }
    } catch {
      // Browser speech is the resilient fallback.
    }
    browserSpeak(reply);
  };

  const respond = async (q: string) => {
    if (!q.trim() || aiBusy) return;
    const question = q.trim();
    setText('');
    setLines((current) => [...current, { from: 'You', text: question }]);
    setAiBusy(true);
    setState('speaking');

    try {
      const history = lines.slice(-8).map((line) => ({
        role: line.from === 'PF Saathi' ? 'assistant' : 'user',
        text: line.text,
      }));
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, language, history }),
      });
      const data = await response.json();
      const reply = typeof data?.reply === 'string' && data.reply.trim() ? data.reply : fallback(question, language);
      setLines((current) => [...current, { from: 'PF Saathi', text: reply }]);
      await speak(reply);
    } catch {
      const reply = fallback(question, language);
      setLines((current) => [...current, { from: 'PF Saathi', text: reply }]);
      await speak(reply);
    } finally {
      setAiBusy(false);
    }
  };

  const listen = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition || aiBusy) return;

    const r = new Recognition();
    recognition.current = r;
    r.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    r.interimResults = false;
    r.maxAlternatives = 1;
    r.onresult = (event: any) => respond(event.results[0][0].transcript);
    r.onerror = () => setState('idle');
    r.onend = () => setState((current) => current === 'listening' ? 'idle' : current);
    setState('listening');
    r.start();
  };

  return (
    <div className="page assistant-page">
      <div>
        <p className="eyebrow">Your guided companion</p>
        <h1>{language === 'hi' ? 'पीएफ़ साथी से बात करें' : 'Talk it through with PF Saathi'}</h1>
        <p className="lead">{language === 'hi' ? 'बोलें या लिखें। मदद दोनों तरह से मिलेगी।' : 'Speak or type. The same help is available both ways.'}</p>
      </div>

      <section className="assistant card">
        <div className="character-area">
          <div className="assistant-mode" aria-label="Assistant language"><span>Voice</span><strong>{language === 'hi' ? 'हिंदी' : 'English'}</strong></div>
          <SaathiCharacter state={state} />
          <b aria-live="polite">{state === 'idle' ? (language === 'hi' ? 'तैयार हूँ' : 'Ready to help') : state === 'listening' ? (language === 'hi' ? 'सुन रही हूँ…' : 'Listening…') : (language === 'hi' ? 'बोल रही हूँ…' : 'Speaking…')}</b>
          {(state === 'listening' || state === 'speaking') && <div><Button className="stop" onClick={stop} type="button">Stop</Button></div>}
          <div className="voice-note">Natural voice when available • browser voice fallback • {language === 'hi' ? 'हिंदी आवाज़ समर्थित' : 'Hindi voice supported'}</div>
        </div>

        <div className="chat" aria-live="polite">
          {lines.map((line, index) => <p className={line.from === 'You' ? 'user' : ''} key={`${line.from}-${index}`}><b>{line.from}</b>{line.text}</p>)}
        </div>

        <form onSubmit={(event) => { event.preventDefault(); respond(text); }}>
          <label htmlFor="ask">{language === 'hi' ? 'पीएफ़ साथी से पूछें' : 'Ask PF Saathi'}</label>
          <div className="ask">
            <input id="ask" value={text} onChange={(event) => setText(event.target.value)} placeholder={language === 'hi' ? 'मेरा claim अभी कहाँ है?' : 'Why is my claim under process?'} disabled={aiBusy} />
            <Button type="submit" disabled={aiBusy}>{aiBusy ? '…' : 'Send'}</Button>
            {supported && <button className="mic" type="button" onPointerDown={listen} aria-label="Speak to PF Saathi" aria-pressed={state === 'listening'}>🎙️</button>}
          </div>
          {!supported && <small>Microphone input isn’t available in this browser. You can still use every feature by typing.</small>}
        </form>

        <div className="suggestions">
          <Button className="secondary" onClick={() => respond(language === 'hi' ? 'मेरा claim समझाइए' : 'Explain this claim')} type="button">Explain this</Button>
          <Button className="secondary" onClick={() => respond(language === 'hi' ? 'मुझे क्या करना चाहिए?' : 'What should I do?')} type="button">What should I do?</Button>
          <Link href="/mismatch"><Button className="secondary" type="button">Check mismatch</Button></Link>
          <Link href="/grievance"><Button className="secondary" type="button">Draft escalation</Button></Link>
        </div>
      </section>
    </div>
  );
}
