# Eluno OMS

AI-powered Order Management System for Eluno (eyewear brand) — covers order lifecycle from intake to delivery, with AI-driven SLA breach prediction and alerts.

## Stack
- Backend: NestJS + PostgreSQL (Prisma) + Redis (BullMQ)
- Frontend: React + Vite + TypeScript
- AI: Claude API (TAT prediction)
- Alerts: Nodemailer (Email) + Twilio (WhatsApp)

## Setup
\`\`\`bash
docker compose up -d   # starts Postgres + Redis
cd backend && npm install
cd frontend && npm install
\`\`\`

## Status
🚧 In progress