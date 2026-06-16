# Eluno OMS

AI-Powered Order Management System for Eluno (eyewear brand). Covers the full order lifecycle from intake to delivery, with automated lens inventory checks, SLA tracking, and AI-driven breach prediction and email alerts.

## Live Demo
- Frontend: [Vercel URL here]
- Backend API: [Railway URL here]

## Features
- Order creation with automatic lens inventory check (in-stock → skips to LENS_CUTTING)
- Full order lifecycle management (ORDER_PLACED → LENS_CUTTING → QC_CHECK → QC_PASSED/FAILED → DISPATCH → DELIVERED)
- Immutable status audit log with mandatory reason on every change
- Dashboard with filters (status, lens type, store), SLA countdown, breach/at-risk flags
- AI-powered TAT breach prediction (Groq — Llama 3.3 70B) with risk band + reasoning
- Automatic email alerts to ops team when breach risk is HIGH

## Tech Stack
- **Backend**: NestJS, TypeScript, Prisma ORM, PostgreSQL, Redis
- **Frontend**: React, Vite, TypeScript, TailwindCSS, TanStack React Query
- **AI**: Groq API (Llama 3.3 70B Versatile)
- **Alerts**: Nodemailer (Gmail SMTP)
- **Deployment**: Railway (backend + Postgres), Vercel (frontend)

## Local Setup

### Prerequisites
- Node.js 18+
- Docker (for Postgres + Redis)

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your values
docker compose up -d   # start Postgres + Redis
npx prisma migrate dev
npm run seed
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture
See `Eluno_OMS_Architecture_Note.docx` in the repo root.

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orders | Create order (auto inventory check) |
| GET | /orders | List orders (paginated, filterable) |
| GET | /orders/:id | Single order with status history |
| PATCH | /orders/:id/status | Update status with reason |
| POST | /orders/:id/predict | AI breach prediction + alert |
| GET | /inventory | List lens inventory |
| POST | /inventory | Add inventory item |
| PATCH | /inventory/:id | Update quantity |
| PATCH | /inventory/:id/add-stock | Add stock |