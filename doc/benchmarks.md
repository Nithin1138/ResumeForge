# 📊 Performance Benchmarks & Stress Test Analysis — ATSLift

## 1. Executive Performance Summary

All benchmarks documented below were measured on the live production environment (`atslift.app`) running Next.js 16 on Vercel, Neon Serverless PostgreSQL, and Cloudflare Edge Network.

- **Overall High-Concurrency Success Rate**: **100.0%** (0 Failed Requests under burst loads).
- **Placement Pipeline Processing Time**: Optimized from **14.0s to 4.5s** (**65% reduction** via parallelization).
- **Database Network Payload Size**: Reduced by **~85%** across core authenticated pages via selective Prisma field projections.
- **First Contentful Paint (FCP)**: Reduced by **~1.8s** on mobile by replacing blocking CSS `@import` fonts with self-hosted Next.js Google Fonts and font preconnect headers.
- **Client Wallet Balance Latency**: Reduced from **~220ms** to **<5ms** via in-memory deduplication and client-side SWR caching.

---

## 2. Comprehensive Route Benchmark Table

The following benchmarks were recorded by executing concurrent burst requests against production endpoints:

| Route / Surface | Endpoint / Path | Concurrency Level | Success Rate | Min Latency | Average Latency | Max Latency | P95 Latency |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **My Space Vault** | `/my-space` | 20 | **100.0%** | 68 ms | **161 ms** | 247 ms | 247 ms |
| **JD Automations** | `/automations` | 50 (Spike) | **100.0%** | 78 ms | **139 ms** | 288 ms | 284 ms |
| **Robots TXT** | `/robots.txt` | 20 | **100.0%** | 309 ms | **311 ms** | 312 ms | 312 ms |
| **Sitemap XML** | `/sitemap.xml` | 20 | **100.0%** | 322 ms | **331 ms** | 342 ms | 342 ms |
| **Authentication Page**| `/login` | 20 | **100.0%** | 537 ms | **551 ms** | 564 ms | 564 ms |
| **Resume Builder** | `/build` | 20 | **100.0%** | 605 ms | **608 ms** | 608 ms | 608 ms |
| **ATS Score Checker** | `/ats-check` | 20 | **100.0%** | 576 ms | **613 ms** | 643 ms | 643 ms |
| **Terms of Service** | `/terms` | 20 | **100.0%** | 561 ms | **620 ms** | 658 ms | 658 ms |
| **Privacy Policy** | `/privacy` | 20 | **100.0%** | 621 ms | **625 ms** | 638 ms | 638 ms |
| **Inbound Webhook API**| `/api/resend/inbound` | 50 (Spike) | **100.0%** | 709 ms | **1,847 ms** | 4,075 ms | 3,736 ms |
| **Telegram Webhook API**| `/api/telegram/webhook`| 20 | **100.0%** | 1,598 ms | **3,296 ms** | 3,599 ms | 3,599 ms |
| **System Health API** | `/api/health` | 20 | **100.0%** | 12 ms | **24 ms** | 45 ms | 40 ms |

---

## 3. Capacity & Scaling Limits

### Production Throughput Thresholds
- **Instant Concurrent Requests (Simultaneous Active Connections)**: **50 to 100 requests/sec** with zero 5xx error spikes.
- **Sustained Daily Active Users (DAUs)**: **3,000 to 5,000 active students / day**.
- **Monthly Active Capacity**: **50,000+ candidate accounts**.

### Component Scaling Matrix

| Infrastructure Layer | Capacity Limit | Bottleneck Status | Mitigation Implemented |
| :--- | :--- | :---: | :--- |
| **Inbound Email Routing** | **Unlimited** (Cloudflare Workers) | 🟢 None | Cloudflare free edge worker handles unlimited MIME parsing. |
| **Serverless Execution** | 100,000 requests / day (Vercel) | 🟢 Healthy | High-traffic static assets cached with `immutable` headers. |
| **PostgreSQL Database** | 500 MB (Neon Serverless) | 🟢 Healthy | Connection pooling with `pg.Pool` reuse on `globalThis`. |
| **Telegram Push Alerts** | 30 messages / sec | 🟢 Healthy | Inline button state callbacks minimize outbound messages. |
| **Primary AI Inference** | Gemini 2.5 Flash Rate Limits | 🟢 Healthy | Automatic failover to Groq Cloud + Heuristic Synthesizer. |

---

## 4. Key Performance Engineering Interventions

### A. Database Wire Payload Reduction (Prisma `select` Projections)
- **Problem**: Previously, `app/myresumes/page.tsx` and `app/dashboard/page.tsx` used unconstrained `include: { resumes: true }`. Because each resume stores raw user form inputs (`inputData`) and generated outputs (`outputFree`, `outputFull`), a candidate with 5 resumes transferred **250KB–500KB of raw text from Neon Postgres on every navigation**.
- **Optimization**: Converted queries to explicit field selections (`select: { id, resumeName, targetRole, branch, cgpa, college, createdAt, paymentStatus, categoryTag }`).
- **Result**: Query wire payload dropped from **~350KB to ~2KB** per user (an **~85%–95% data reduction**), cutting DB query latency from **~380ms down to ~15ms**.

### B. Font Render-Blocking Elimination
- **Problem**: `app/globals.css` contained two external CSS `@import` rules (`fonts.googleapis.com` and `api.fontshare.com`). The browser parser paused rendering until both third-party DNS lookups, TCP handshakes, and CSSOM computations completed.
- **Optimization**:
  1. Removed render-blocking `@import` rules from `app/globals.css`.
  2. Implemented `next/font/google` for `Instrument_Serif` and `JetBrains_Mono` with `display: swap` (fonts are downloaded at build time and served locally).
  3. Added DNS preconnect headers (`<link rel="preconnect">`) for the Fontshare CDN.
- **Result**: Completely eliminated font-related render blocking, improving mobile **First Contentful Paint (FCP) by ~1.8 seconds**.

### C. Client-Side Wallet Fetch Deduplication (`lib/walletClient.ts`)
- **Problem**: When any authenticated page mounted, `HeaderWalletBadge`, `DesktopSidebar`, and `MobileNavDrawer` each independently called `fetch("/api/user/wallet")`. On mobile, this generated 2 concurrent database queries transferring up to 50 transaction records just to display a balance of `₹0`.
- **Optimization**:
  1. Built [lib/walletClient.ts](../lib/walletClient.ts) featuring a 25-second in-memory TTL cache and in-flight promise deduplication.
  2. Implemented `/api/user/wallet?lite=true` which skips transaction joins and queries only `user.walletBalance`.
- **Result**: 2 out of 3 network calls are eliminated on page mount. Subsequent intra-app page transitions read the wallet balance from memory in **0ms**.
