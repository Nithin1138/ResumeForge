# 📚 ATSLift / ResumeForge — Technical Documentation Portal

Welcome to the central technical documentation portal for **ATSLift (ResumeForge)**. This repository houses a production-grade AI resume platform and autonomous campus placement engine engineered specifically for engineering students.

---

## 🧭 Documentation Directory

Explore the architectural, operational, and development documentation below:

| Document | Description | Target Audience |
| :--- | :--- | :--- |
| **[architecture.md](architecture.md)** | High-level system architecture, cloud topology, component boundaries, and technology stack breakdown. | System Architects, Tech Leads, Interviewers |
| **[system-design.md](system-design.md)** | Deep-dive into data models, parallel AI pipelines, state machines, async queues, and database lifecycle. | Senior Engineers, Backend Developers |
| **[benchmarks.md](benchmarks.md)** | Stress test reports, concurrency benchmarks, database wire payload reductions, and latency metrics. | DevOps, SREs, Performance Engineers |
| **[testing-strategy.md](testing-strategy.md)** | Test runner architecture, test suites (20 tests), HMAC cryptographic validation, and mock modes. | QA Engineers, Contributors |
| **[demo-guide.md](demo-guide.md)** | End-to-end walkthrough script for live demos, recruiter screens, and technical interviews. | Recruiters, Interviewers, Evaluators |
| **[api-reference.md](api-reference.md)** | OpenAPI-style specification for core endpoints, payloads, query parameters, and error status codes. | Frontend/Backend Developers, Integrators |
| **[security-and-compliance.md](security-and-compliance.md)** | HMAC webhook verification, sliding window rate limiting, daily quotas, and secret management. | Security Auditors, Compliance Teams |

---

## ⚡ High-Level System Overview

```mermaid
flowchart TD
    subgraph Clients["📱 Multi-Device Clients"]
        Web["Desktop Web (Chrome/Firefox/Safari)"]
        Mobile["Mobile Web (Responsive Drawer & Bottom Nav)"]
    end

    subgraph Edge["🛡️ Edge Network & Routing"]
        CF["Cloudflare DNS & Email Routing Worker"]
        VercelEdge["Vercel Edge Network (Global CDN)"]
    end

    subgraph AppServer["⚡ Next.js 16 Serverless Application"]
        App["App Router (SSR & RSC)"]
        API["Route Handlers (/api/*)"]
        PrismaClient["Prisma ORM 7 + pg.Pool Reuse"]
    end

    subgraph External["🌐 Third-Party Services"]
        Gemini["Google Gemini 2.5 Flash"]
        Groq["Groq Cloud LLM (Low-Latency Fallback)"]
        NeonDB["Neon Serverless PostgreSQL"]
        Razorpay["Razorpay INR Gateway (Webhooks)"]
        QStash["Upstash QStash Async Scheduler"]
        Telegram["Telegram Bot API (@BotFather)"]
    end

    Clients --> VercelEdge
    CF -->|Placement Email Webhook| API
    VercelEdge --> AppServer
    AppServer --> PrismaClient
    PrismaClient --> NeonDB
    API --> Gemini
    Gemini -.->|Timeout / Error Fallback| Groq
    API --> Razorpay
    API --> QStash
    API --> Telegram
```

---

## 🛠️ Quick Reference Commands

```bash
# Install dependencies
npm install

# Run all 20 unit & integration tests
npm test

# Run production build validation
npm run build

# Start local development server
npm run dev

# Query live system health check
curl http://localhost:3000/api/health
```

---

## 📖 Related Master Guides
- **Master Interview Architecture Deep-Dive:** [RESUME.md](../RESUME.md)
- **Top-Level Project Readme:** [README.md](../README.md)
- **Environment Configuration Reference:** [.env.example](../.env.example)
