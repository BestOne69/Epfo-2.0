'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/layout/Shell';
import { copy } from '@/lib/i18n';
import { Button } from '@/components/ui/Button';
import { SaathiCharacter } from '@/components/assistant/SaathiCharacter';

const cards = [
  ['01', 'Catch a mismatch early', 'Compare records before a claim journey begins.', '/mismatch'],
  ['02', 'Understand your claim', 'Turn a status into clear next steps.', '/status'],
  ['03', 'See PF and pension separately', 'Keep withdrawable PF and EPS easy to understand.', '/passbook'],
  ['04', 'Follow up with confidence', 'Prepare a concise escalation for a stalled case.', '/grievance'],
];

export default function Home() {
  const { language } = useLanguage();
  const t = copy[language];

  return (
    <>
      <section className="hero">
        <div>
          <p className="eyebrow">A kinder way to navigate PF</p>
          <h1>{t.hero}</h1>
          <p className="lead">{t.sub}</p>
          <div className="pills">
            <span>Plain language</span>
            <span>Hindi + English</span>
            <span>{t.synthetic}</span>
          </div>
          <div className="actions">
            <Link href="/status"><Button>{t.check} <b>→</b></Button></Link>
            <Link href="/saathi"><Button className="secondary">{t.talk} <b>✦</b></Button></Link>
          </div>
        </div>
        <div className="hero-art">
          <SaathiCharacter />
          <div className="speech">{language === 'hi' ? 'नमस्ते! इसे आसान बनाते हैं।' : 'Hi! Let’s make this simpler.'}</div>
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">One clear journey</p>
        <h2>From confusion to confidence.</h2>
        <div className="grid">
          {cards.map(([num, title, text, href]) => (
            <Link className="feature card" href={href} key={title}>
              <span>{num}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <b>Explore →</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <p className="eyebrow">Built around real friction</p>
        <div className="visual-strip">
          <Link href="/mismatch" className="visual-tile mint">
            <span>01 · Before you file</span>
            <strong>Catch small detail mismatches early.</strong>
          </Link>
          <Link href="/status" className="visual-tile blue">
            <span>02 · While you wait</span>
            <strong>Know what your status means.</strong>
          </Link>
          <Link href="/passbook" className="visual-tile peach">
            <span>03 · Your balance</span>
            <strong>PF and pension, clearly separated.</strong>
          </Link>
        </div>
      </section>

      <section className="split section">
        <div>
          <p className="eyebrow">Meet your companion</p>
          <h2>Voice when helpful. Text always available.</h2>
        </div>
        <div className="card">
          <h3>Ask in English or Hindi.</h3>
          <p>Talk, type, tap a suggestion, or stop anytime.</p>
          <Link href="/saathi"><Button>Meet PF Saathi</Button></Link>
        </div>
      </section>

      <section className="section promise">
        <p className="eyebrow">Privacy first</p>
        <h2>A prototype, not a portal.</h2>
        <p>Every identity, balance, status, timeline and reference number is synthetic.</p>
      </section>
    </>
  );
}
