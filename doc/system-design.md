# ⚙️ System Design & Data Lifecycle — ATSLift

## 1. Relational Data Modeling & Entity Relationships

The ATSLift data architecture is modeled in PostgreSQL using Prisma ORM. The schema is organized into four core functional domains: **Identity & Access**, **Candidate Artifacts**, **Autonomous Placement Automations**, and **Billing & Auditing**.

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ Session : maintains
    User ||--o{ Resume : creates
    User ||--o{ CoverLetter : generates
    User ||--o| MasterProfile : owns
    User ||--o| TelegramUser : links
    User ||--o{ WalletTransaction : records
    User ||--o{ AtsScoreCheck : audits

    Resume ||--o{ CoverLetter : references

    TelegramUser ||--o{ JobPosting : receives
    JobPosting ||--o{ Reminder : schedules
    JobPosting ||--o{ AtsScoreCheck : evaluates
    MasterProfile ||--o{ AtsScoreCheck : audits
```

---

## 2. Core Entity Schemas & Indexing Strategy

### A. Candidate Artifacts: `Resume` & `CoverLetter`
- **`Resume`**:
  - `id`: CUID primary key.
  - `userId`: Nullable foreign key (supports anonymous guest creation before sign-in).
  - `sessionId`: Session UUID for guest candidate state synchronization.
  - `status`: Lifecycle state (`DRAFT` ➔ `GENERATED` ➔ `PAID` ➔ `EXPORTED`).
  - `inputData`: JSON string containing candidate-entered personal, education, skills, and project parameters.
  - `outputFree`: JSON string storing masked preview and teaser scores.
  - `outputFull`: JSON string storing full ATS-optimized content and recruiter audit scores.
  - `paymentStatus`: Billing state (`PENDING`, `PAID`, `FAILED`, `REFUNDED`).
  - **Indexes**: `@@index([sessionId])`, `@@index([paymentStatus])` for high-throughput polling and webhook reconciliation.

- **`CoverLetter`**:
  - `id`: CUID primary key.
  - `userId`: Cascading foreign key to `User`.
  - `resumeId`: Optional reference to source `Resume`.
  - `companyName`, `targetRole`: Target application metadata.
  - `openingParagraph`, `bodyParagraph`, `closingParagraph`: Text body sections.
  - **Indexes**: `@@index([userId])`, `@@index([resumeId])`.

### B. Personal Data Vault: `MasterProfile`
- Single source of truth for student credentials:
  - CGPA, Active Backlogs, Academic Gap Years, College Name, Degree.
  - Coding profiles (`leetcode`, `codeforces`, `codechef`, `hackerrank`, `gfg`).
  - Raw JSON arrays for skills, projects, certifications, and achievements.
  - Custom pinned sections for one-tap clipboard copy during placement applications.
  - **Index**: `@@unique([userId])`.

### C. Placement Automation: `TelegramUser`, `JobPosting`, `Reminder`
- **`TelegramUser`**:
  - `inboundAlias`: Unique student email alias (`jd_xxx@atslift.app`).
  - `telegramChatId`: Unique Telegram conversation ID for instant push alerts.
  - **Indexes**: `@@index([telegramChatId])`, `@@index([inboundAlias])`.
- **`JobPosting`**:
  - Stores parsed company name, role, raw email text, eligibility criteria, and drive dates.
  - `eligibilityCheckResult`: `"eligible"` | `"not_eligible"` | `"uncertain"`.
  - `status`: `NEW` | `NOTIFIED` | `APPLIED` | `SKIPPED` | `EXPIRED` | `MANUAL_REVIEW`.
  - **Indexes**: `@@index([telegramUserId])`, `@@index([status])`.
- **`Reminder`**:
  - `scheduledFor`: Future execution timestamp.
  - `reminderType`: `THREE_DAYS_BEFORE` | `ONE_DAY_BEFORE` | `DAY_OF`.
  - **Index**: `@@index([scheduledFor, sent])`.

---

## 3. Parallel AI Pipeline (`Promise.allSettled`)

### The 14s ➔ 4.5s Latency Optimization
Originally, when an incoming campus placement email was received, the backend processed operations sequentially:
1. Parse email text with Gemini (5.5s)
2. Run candidate eligibility analysis (4.5s)
3. Run ATS resume scoring against JD (4.0s)
*Total Latency:* ~14 seconds (frequently hitting serverless 15s function timeout limits).

### Optimized Architecture:
By executing independent evaluations concurrently using `Promise.allSettled`:
```ts
const [eligibilityResult, atsScoreResult] = await Promise.allSettled([
  evaluateEligibilityWithGemini(userProfile, extractedJd),
  computeAtsScoreWithGemini(userProfile.resumes[0], extractedJd),
]);
```
- **Wall-Clock Latency**: Decreased from **14.0s to 4.5s** (a **65% latency reduction**).
- **Fault-Isolation**: If the ATS scorer times out, the eligibility evaluator still succeeds, ensuring the student never misses a critical placement drive alert.

```mermaid
gantt
    title Processing Latency Comparison (Placement Ingestion)
    dateFormat  s
    axisFormat  %S s

    section Sequential (Before: 14.0s)
    Email Parsing & Extraction  :des1, 0, 5.5s
    Eligibility Verification     :des2, 5.5, 10.0s
    ATS Resume Score Calculation :des3, 10.0, 14.0s

    section Parallelized (Current: 4.5s)
    Email Extraction            :act1, 0, 1.8s
    Eligibility Check           :act2, 1.8, 4.5s
    ATS Score Evaluation        :crit, act3, 1.8, 4.3s
```

---

## 4. Multi-Tier Parsing & Extraction Engine

Incoming placement emails vary wildly in formatting: plain text, bullet points, HTML tables with nested cells, and unformatted forwarded threads.

The extraction pipeline follows a **3-Tier Fallback Strategy**:
1. **Tier 1 — Multimodal HTML Table Preprocessing**:
   - Strips tracking pixels and base64 styles.
   - Extracts structured key-value pairs from HTML tables (`table`, `tr`, `td`) into plain key-value text.
2. **Tier 2 — Primary LLM Extraction (Gemini 2.5 Flash)**:
   - Evaluates text against a strict JSON schema: `companyName`, `roleTitle`, `eligibilityCriteria`, `packageDetails`, `deadline`.
3. **Tier 3 — Heuristic Regex Synthesizer (Fallback)**:
   - If upstream LLM APIs fail or time out (>20s), regex patterns extract company names (`/(?:Drive for|Campus hiring|Recruitment for)\s+([A-Za-z0-9\s&]+)/i`), salary packages (`/(\d+(?:\.\d+)?\s*(?:LPA|Lakhs|CTC))/i`), and ISO application deadlines.

---

## 5. Asynchronous Scheduling via Upstash QStash

Rather than maintaining dedicated Celery/BullMQ workers that require persistent server memory, ATSLift offloads scheduled reminders to **Upstash QStash**:

```
[Inbound Email Received]
         │
         ▼
[Compute Deadlines]
   ├── Deadline - 72 Hours ──▶ QStash HTTP Message (Delay: 72h)
   ├── Deadline - 24 Hours ──▶ QStash HTTP Message (Delay: 24h)
   └── Deadline Morning    ──▶ QStash HTTP Message (Delay: Day-Of)
                                     │
                                     ▼
                    [Webhook Trigger: /api/qstash/send-reminder]
                                     │
                                     ▼
                          [Telegram Bot Push Alert]
```

- **Zero Idle Costs**: No server runs when no deadlines are pending.
- **Automatic Exponential Backoff**: Failed delivery attempts are retried up to 3 times before routing to a dead-letter log.
