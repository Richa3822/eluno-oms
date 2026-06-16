# Eluno OMS — AI Architecture Note

**Eyewear Order Management System with AI-assisted SLA breach prediction** · Richa · June 2026

**Live URLs:** Frontend (Vercel): _https://eluno-oms-git-main-richa-s-projects7.vercel.app_ · Backend API (Railway): _https://eluno-oms-production-2f8d.up.railway.app_

---

### Overview
Eluno OMS tracks eyewear orders through their fulfilment stages (order placed → lens cutting → QC → dispatch → delivered) against a per-lens-type **SLA deadline**. The AI layer answers one question: **"Will this order breach its SLA, and why?"** — so the ops team can act before a deadline is missed.

### AI Model / API
| | |
|---|---|
| Provider | Groq Cloud (OpenAI-compatible Chat Completions API) |
| Model | `llama-3.3-70b-versatile` (Meta Llama 3.3, 70B) |
| Settings | Temperature `0.3`, strict JSON output: `{ riskBand, reason }` |

**Why Groq + Llama 3.3 70B:** ultra-low latency so predictions feel instant in the dashboard; a 70B model reasons reliably over the order signals and gives a human-readable justification; generous free tier keeps costs near zero; and the OpenAI-compatible API means the model can be swapped by changing one URL — no rewrite.

### How prediction works
The backend computes deterministic features first, then asks the model to reason over them — keeping results **explainable, not hallucinated**. Features sent: lens type & coating, current stage and full stage history, QC failures so far, % of SLA window elapsed, and hours remaining. The model returns a risk band (**LOW / MEDIUM / HIGH**) plus a one-sentence reason citing those factors.

### Automated alerting
When an order is classified **HIGH** risk, the backend automatically emails the ops team (Nodemailer/Gmail) with the order details and the AI's reasoning. Predictions and alerts are persisted for audit.

### Tech stack
- **Frontend:** React 19 + TypeScript + Vite, Tailwind, React Query — hosted on Vercel
- **Backend:** NestJS + Prisma + PostgreSQL — hosted on Railway
- **AI:** Groq (Llama 3.3 70B) · **Notifications:** Nodemailer (email)

### Security
All AI calls run **server-side**, so the key never reaches the browser. The Groq key, database URL, and email credentials are stored as **environment variables** on the host — never committed to the repo.
