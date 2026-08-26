'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useState } from 'react';
import { Language, copy } from '@/lib/i18n';
import { PrototypeBanner } from '@/components/prototype/PrototypeBanner';

const C = createContext<{ language: Language; setLanguage: (x: Language) => void }>({
  language: 'en',
  setLanguage: () => {},
});

export const useLanguage = () => useContext(C);

export function Shell({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const value = localStorage.getItem('pf-language') as Language | null;
    if (value === 'en' || value === 'hi') setLanguage(value);
  }, []);

  const change = (value: Language) => {
    setLanguage(value);
    localStorage.setItem('pf-language', value);
    document.documentElement.lang = value === 'hi' ? 'hi' : 'en';
  };

  const t = copy[language];

  return (
    <C.Provider value={{ language, setLanguage: change }}>
      <header>
        <Link className="brand" href="/" aria-label="PF Saathi home">
          pf<span>saathi</span>
        </Link>
        <nav aria-label="Primary navigation">
          {[
            ['/', t.home],
            ['/status', t.status],
            ['/saathi', t.saathi],
            ['/grievance', t.help],
          ].map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </nav>
        <div className="lang" aria-label="Language">
          <button onClick={() => change('en')} aria-pressed={language === 'en'}>EN</button>
          <button onClick={() => change('hi')} aria-pressed={language === 'hi'}>हिंदी</button>
        </div>
      </header>

      <PrototypeBanner />
      <main>{children}</main>

      <footer>
        <div className="footer-grid">
          <div>
            <div className="footer-title">pf<span style={{ color: 'var(--green)' }}>saathi</span></div>
            <div>{language === 'hi' ? 'पीएफ़ सेवाओं को सरल समझ में बदलने वाला स्वतंत्र प्रोटोटाइप।' : 'A friendly companion for understanding a synthetic PF journey.'}</div>
          </div>
          <div>
            <div className="footer-title">Explore</div>
            <div className="footer-links">
              <Link href="/status">{t.status}</Link>
              <Link href="/saathi">{t.saathi}</Link>
              <Link href="/mismatch">Mismatch check</Link>
              <Link href="/passbook">Passbook</Link>
            </div>
          </div>
          <div>
            <div className="footer-title">Trust</div>
            <div className="footer-links">
              <span>Hindi + English</span>
              <span>Accessible by voice or text</span>
              <span>Synthetic data only</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Independent hackathon prototype — not affiliated with EPFO or the Government of India.</span>
          <span>Never enter real identity or financial information.</span>
        </div>
      </footer>
    </C.Provider>
  );
}
