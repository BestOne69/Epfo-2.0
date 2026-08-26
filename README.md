# PF Saathi

**PF Saathi** is an independent hackathon prototype for *Build What Moves India*. It is a citizen-facing companion that makes a synthetic PF journey easier to understand before it becomes frustrating.

> **Not affiliated with EPFO or the Government of India.** Every identity, reference, balance, timeline, claim, and office in this prototype is synthetic.

## What it demonstrates

- A mobile-first, bilingual (English/Hindi) journey: Home → PF Saathi → mismatch check → claim status → passbook → grievance escalation.
- Browser speech recognition and speech synthesis when available, with a complete typed fallback.
- Deterministic identity normalization/comparison, claim-state transitions, PF math, and illustrative grievance threshold behavior.
- Optional server-side AI route boundaries with safe deterministic fallback responses when `OPENAI_API_KEY` is absent.
- Accessible semantic controls, large interaction targets, visible focus styles and reduced-motion support.

## What is real vs mocked

**Real:** interactive UI, responsive/accessibility behavior, browser Web Speech APIs, deterministic application logic, and optional server-side AI integration.

**Mocked:** Aadhaar/UAN/bank details, claims, passbooks, EPS amounts, grievance records, processing estimates, routing offices, and all reference numbers.

PF Saathi does **not** connect to or access EPFO, Aadhaar, UAN, PAN, banking, or payment systems. Do not enter real personal or financial data.

## Architecture

```text
Citizen
  ↓
PF Saathi UI (Next.js App Router)
  ↓
Deterministic application logic
  ↓
AI layer only when judgment/natural wording is needed
  ↓
Synthetic mock data
```

The deterministic/AI boundary is intentional:

- `lib/deterministic`: normalisation, reproducible similarity classification, claim state machine and passbook math.
- `data/mock.ts`: typed synthetic cases only.
- `app/api/*`: server-only integration boundary. They return safe fallbacks by default; no API key is shipped to the client.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Optional environment setup for a future server-side OpenAI implementation:

```bash
OPENAI_API_KEY=
```

Keep this variable server-side only. The current prototype works without it.

## Checks

```bash
npm run typecheck
npm test
npm run build
```
