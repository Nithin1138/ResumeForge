# 🚀 ResumeForge (ATSLift) — AI Resume Platform & Autonomous Campus Placement Engine

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2_(App_Router)-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini-8E75C2?style=flat-square&logo=google)](https://ai.google.dev/)
[![Tests](https://img.shields.io/badge/Tests-20_Passed-brightgreen?style=flat-square&logo=node.js)](tests/)

> **Live Platform:** [atslift.app](https://atslift.app)  
> **Master Technical Interview Guide:** [RESUME.md](RESUME.md)  
> **📚 Comprehensive Project Documentation Portal:** [/doc/README.md](doc/README.md)  
> *(Includes: [Architecture](doc/architecture.md), [System Design](doc/system-design.md), [Testing Strategy](doc/testing-strategy.md), [Demo Guide](doc/demo-guide.md), [Benchmarks](doc/benchmarks.md), [API Reference](doc/api-reference.md), [Security](doc/security-and-compliance.md))*

ResumeForge (ATSLift) is a production-grade full-stack web application and autonomous placement drive engine engineered for engineering students. It converts raw academic records into recruiter-aligned ATS resumes, computes real-time keyword gap scores, and autonomously monitors incoming campus placement emails to verify eligibility and broadcast instant Telegram alerts.

---

## 🏗️ High-Level System Architecture

```mermaid
flowchart LR
    subgraph Ingestion["1. Ingestion Layer"]
        A[Campus Placement Email] --> B[Cloudflare Email Worker]
        B --> C[Resend Webhook: /api/resend/inbound]
    end

    subgraph CoreEngine["2. Processing & Parallel AI Pipeline"]
        C --> D[Prisma + Neon PostgreSQL]
        D --> E[Promise.allSettled Parallel Queue]
        E --> F[Gemini Eligibility Evaluator]
        E --> G[Gemini ATS Scoring Engine]
        G -.->|Fallback if LLM Fails| H[Heuristic Scoring Synthesizer]
    end

    subgraph Notification["3. Delivery & Deep Links"]
        F & G --> I[Telegram Bot API: Rich HTML Alert]
        I --> J[Student Telegram with Deep Links]
        C -->|Deadline Present| K[Upstash QStash Delay Queue]
        K -->|24h / 2h Before| I
    end
```

---

## ⚡ Core Engineering Highlights

* **65% Latency Optimization (14s → 4.5s):** Parallelized LLM eligibility verification and ATS scoring using `Promise.allSettled`, preventing serverless function timeouts and eliminating cascading bottlenecks.
* **Fault-Tolerant AI Fallbacks:** Built-in heuristic scoring engine ensures zero downtime; if Gemini times out or outputs unparseable JSON, the system gracefully calculates a multi-factor baseline score and actionable suggestions.
* **Structured Observability:** Integrated structured JSON logger (`lib/logger.ts`) with automated latency tracing (`logger.timeAsync`), sensitive credential redaction, and error categorization.
* **Automated Rate Limiting:** Enforces a daily quota of 10 automated ATS checks per user via atomic PostgreSQL count queries (`getDailyAtsCheckCount`).
* **Resilient Payment Webhooks:** Robust signature-verified HMAC SHA-256 webhook handling supporting `payment_link.paid`, `payment.failed`, `payment_link.expired`, and `refund.processed`.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js 16.2 (App Router, React 19), Tailwind CSS v4, Lucide React, Zustand |
| **Backend** | Next.js Server Components, Server Actions, Route Handlers, TypeScript |
| **Database & ORM** | Neon Serverless PostgreSQL with Connection Pooling, Prisma ORM 7 |
| **AI & NLP** | Google Gemini 1.5/2.0 API (`@google/genai`), Groq Fallback Engine, spaCy |
| **Async Queues & Cloud** | Cloudflare Email Workers, Resend Webhooks, Upstash QStash HTTP queues, Vercel |
| **Messaging & Bot** | Telegram Bot API with inline action callbacks (`Applied`, `Skip`, `Update Resume`) |
| **Testing** | Node 20+ Native Test Runner via `tsx` (15 Unit & Integration tests) |

---

## 🧪 Testing & Quality Engineering

The test suite runs with zero external test framework bloat using Node's built-in test runner:

```bash
# Run all 20 unit, integration, and navigation tests
npm test

# Run stress & concurrency benchmarks against live routes
npm run stress:test

# Run email pipeline simulation tests
npm run test:email:all
```

### Test Coverage Highlights:
- **`tests/unit/navigation.test.ts`**: Mobile drawer & 1-thumb bottom navigation route uniqueness, valid paths, and active matching logic.
- **`tests/unit/atsFormatting.test.ts`**: Section extraction, line limits, and tech stack deduplication.
- **`tests/unit/atsScoring.test.ts`**: ATS gap analysis, score boundary clamping [35, 95], and heuristic fallbacks.
- **`tests/unit/eligibilityChecker.test.ts`**: Multi-branch matching rules, CGPA cutoffs, and non-rejection uncertain fallbacks.
- **`tests/integration/apiFlow.test.ts`**: Webhook payload validation, HMAC SHA-256 signature verification, and schema integrity.

### Quick Manual Verification Flows:
1. **ATS Check & Rate Limiting (`/api/ats-check`)**: Upload a PDF or Word file under 5MB. Files >5MB or unsupported formats receive clean, student-friendly error advice. Rate limited to 10 requests/min per IP.
2. **Sandbox Payment Flow**: Navigate to payment and append `?sandbox=true` to instantly test webhook unlocking without live INR charges.
3. **Platform Health Ping (`/api/health`)**: Query `GET /api/health` for real-time uptime, PostgreSQL connection status, and AI engine availability.

---

## 🚀 Quickstart for Local Development

### 1. Clone & Install
```bash
git clone https://github.com/Nithin1138/ResumeForge.git
cd ResumeForge
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Key required environment variables:
```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"
GEMINI_API_KEY="your-google-gemini-key"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Migration
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📖 In-Depth Technical Guide
For complete technical interview questions, architecture trade-offs, and resume bullet points, see **[RESUME.md](RESUME.md)**.
