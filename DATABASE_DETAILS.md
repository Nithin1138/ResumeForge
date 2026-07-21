# Database & Data Lifecycle Architecture of ATSLift

Here is a comprehensive breakdown of how your project stores user accounts, manages resume and cover letter working data, handles AI generation, and maintains data integrity.

---

## 1. Core Database Architecture

The application uses **PostgreSQL** (hosted serverlessly on **Neon DB**) as the database engine and **Prisma ORM** as the type-safe data access layer.

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Web Application                │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
     NextAuth.js (Auth)               Prisma ORM Client
               │                              │
               └──────────────┬───────────────┘
                              ▼
                Neon PostgreSQL Database (Cloud)
```

---

## 2. Breakdown of Data Entities & Schemas

### A. User & Authentication Data
- **`User`**: Stores primary candidate credentials, full name, email address, password hash, referral code, and account block status.
- **`Account` & `Session`**: Managed automatically by NextAuth.js for OAuth providers (e.g. Google Sign-In) and persistent session tokens.

### B. Resume Working Data (`Resume`)
When a candidate fills out the 5-step resume form or uploads a PDF resume, data flows as follows:

| Field | Type | Description / Purpose |
| :--- | :--- | :--- |
| `id` | String (`cuid`) | Unique identifier for each created resume. |
| `userId` | String (Optional) | Foreign key linking the resume to a registered candidate. |
| `sessionId` | String | Session ID for guest/anonymous candidates before login/payment. |
| `inputData` | String (JSON) | Structured candidate input (*personal info, education, skills, projects, work experience, achievements*). |
| `outputFree` | String (JSON) | Free tier teaser content (*masked ATS preview, basic bullet points*). |
| `outputFull` | String (JSON) | Complete, unlocked ATS-optimized resume content + ATS Score + detailed audit metrics. |
| `status` & `paymentStatus` | String | Pipeline tracking (`DRAFT` ➔ `GENERATED` ➔ `PAID` ➔ `EXPORTED`). |

### C. Cover Letter Data (`CoverLetter`)
Stores generated cover letters linked to candidate profiles and target company applications:

| Field | Type | Description / Purpose |
| :--- | :--- | :--- |
| `id` | String (`cuid`) | Unique identifier. |
| `userId` | String | Links the cover letter to the candidate's account for dashboard retrieval. |
| `resumeId` | String (Optional) | Links to the specific resume used as context. |
| `companyName` & `targetRole` | String | Target application details (*e.g., Google — Software Engineer*). |
| `candidateName` & `candidateLocation` | String | Candidate contact header information. |
| `openingParagraph`, `bodyParagraph`, `closingParagraph` | String (Text) | High-impact, ATS-formatted body paragraphs. |

### D. Operational & Admin Data
- **`AdminConfig`**: Controls live pricing (₹49), flash sale banners, hero headlines, and feature flags dynamically without redeploying code.
- **`AnalyticsEvent` & `ExperimentAssignment`**: Logs page visits, ATS check button clicks, conversion rates, and A/B test variants.
- **`PaymentEvent`**: Records Razorpay transactions and webhook events for billing verification.

---

## 3. Data Lifecycle: How Data Moves (Input ➔ Generation ➔ Storage)

```
[Candidate Input / PDF Upload]
         │
         ▼
[POST /api/generate or /api/generate-cover-letter]
         │
         ├──> AI LLM Engine (Google Gemini / OpenRouter)
         │       └─> Generates ATS-optimized structured output JSON
         │
         ├──> Database Storage (PostgreSQL)
         │       ├─> Saves Resume (inputData + outputFull)
         │       └─> Saves CoverLetter (userId, company, paragraphs)
         │
         ▼
[Dashboard & Preview Pages]
         ├─> Interactive React Live Preview (Modern, Elegant, Executive templates)
         └─> Print / Export Engine (100% Single-Page A4 PDF download)
```

---

## 4. Why This Specific Stack & Database Choice?

1. **Why PostgreSQL instead of SQLite or MongoDB?**
   - **Relational Integrity**: Resumes and Cover Letters are strictly linked to `User` accounts via Foreign Keys with cascading updates.
   - **Serverless Scaling**: Neon PostgreSQL automatically sleeps when idle and scales up during high-traffic placement seasons.
   - **Production Readiness**: SQLite is single-file and unsuitable for concurrent multi-user production deployments on platforms like Vercel or AWS.

2. **Why Store Input as JSON String inside PostgreSQL?**
   - **Flexible Resume Structures**: Candidate resumes vary wildly (*some have 4 projects, others have 2 internships, others have certifications*). Storing input as structured JSON within PostgreSQL provides document database flexibility while maintaining PostgreSQL relational speed.

3. **Why Prisma ORM?**
   - **100% Type Safety**: TypeScript knows the exact shape of `user.resumes` and `user.coverLetters` at compile-time (`npx tsc --noEmit`), eliminating runtime database crashes.