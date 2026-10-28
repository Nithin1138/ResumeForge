# 🔌 API Reference Specification — ATSLift

This document details the primary public and internal Route Handlers (`/api/*`) powering ATSLift.

---

## 🔐 Authentication & Header Conventions

- **Session Authentication**: Authenticated routes require a valid NextAuth session cookie (`next-auth.session-token` or `__Secure-next-auth.session-token`).
- **Webhook Authentication**: Webhooks require cryptographic signature headers:
  - Razorpay: `x-razorpay-signature` (HMAC SHA-256)
- **Content Types**: All endpoints consume and output `application/json`, with the exception of `/api/ats-check` which consumes `multipart/form-data`.

---

## 1. Resume & ATS Engine Endpoints

### `POST /api/ats-check`
Analyzes an uploaded resume against universal tech company recruiting benchmarks and extracts structured parameters for the builder wizard.

- **Content-Type**: `multipart/form-data`
- **Rate Limit**: 10 requests per minute per IP address.
- **Request Form Fields**:
  - `file`: Resume binary file (PDF, DOCX, or Image). Maximum size: **5MB**.
- **Success Response (`200 OK`)**:
  ```json
  {
    "overallScore": 84,
    "categories": [
      {
        "name": "Keyword Match & Searchability",
        "weightage": 35,
        "score": 30,
        "feedback": "Strong Python and Cloud keyword alignment."
      },
      {
        "name": "Resume Parsing & Structure",
        "weightage": 25,
        "score": 22,
        "feedback": "Clean single-column layout with parseable headers."
      }
    ],
    "extractedData": {
      "personal": {
        "fullName": "Jane Doe",
        "email": "jane@example.com",
        "targetRole": "Software Development Engineer"
      },
      "skills": {
        "categories": {
          "languages": "Python, TypeScript, Go",
          "frameworks": "Next.js, FastAPI, Node.js"
        }
      },
      "projects": []
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: `{ "error": "No resume file was attached...", "code": "NO_FILE" }`
  - `400 Bad Request`: `{ "error": "File size exceeds 5MB limit...", "code": "FILE_TOO_LARGE" }`
  - `429 Too Many Requests`: `{ "error": "You've submitted multiple ATS checks quickly...", "code": "RATE_LIMITED", "retryAfter": 45 }`
  - `422 Unprocessable`: `{ "error": "Resume parsing completed with formatting issues...", "code": "UNREADABLE_DOCUMENT" }`

---

### `POST /api/generate`
Generates an ATS-optimized, recruiter-aligned resume from candidate form inputs.

- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "personal": { "fullName": "Jane Doe", "email": "jane@example.com", "targetRole": "SDE-1" },
    "education": { "collegeName": "NIT", "branch": "Computer Science", "cgpa": "8.8" },
    "skills": { "categories": { "languages": "C++, Python" } },
    "projects": [{ "title": "Distributed Cache", "techStack": "Go, Redis" }],
    "options": { "jobDescription": "Looking for Go engineers...", "tone": "Professional & Formal" }
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "resumeId": "clx...",
    "status": "GENERATED",
    "paymentStatus": "PENDING"
  }
  ```

---

### `POST /api/generate-cover-letter`
Synthesizes a tailored, single-page application cover letter matching target company values.

- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
    "companyName": "Google",
    "targetRole": "Software Engineer Intern",
    "tone": "Professional & Executive",
    "candidateName": "Jane Doe",
    "candidateEmail": "jane@example.com",
    "candidateLocation": "Bengaluru, India"
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "coverLetter": {
      "id": "clx...",
      "openingParagraph": "Dear Hiring Team at Google...",
      "bodyParagraph": "During my academic projects at NIT...",
      "closingParagraph": "I look forward to discussing...",
      "salutation": "Dear Hiring Team,",
      "signOff": "Sincerely,"
    }
  }
  ```

---

## 2. Platform Observability & Health

### `GET /api/health`
Health check and runtime status endpoint for uptime monitors (Vercel, Datadog, BetterStack).

- **Headers**: `Cache-Control: no-store, no-cache, must-revalidate`
- **Success Response (`200 OK`)**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-28T18:40:00.000Z",
    "uptimeSeconds": 1420,
    "environment": "production",
    "version": "1.0.0",
    "database": {
      "status": "connected",
      "latencyMs": 14,
      "provider": "postgresql"
    },
    "services": {
      "ai": {
        "gemini": "active",
        "groq": "configured"
      },
      "payments": {
        "razorpay": "live"
      },
      "messaging": {
        "telegram": "enabled",
        "resend": "live"
      }
    }
  }
  ```
- **Degraded Response (`503 Service Unavailable`)**:
  ```json
  {
    "status": "degraded",
    "database": { "status": "unavailable", "latencyMs": null, "provider": "postgresql" }
  }
  ```

---

## 3. Candidate Wallet & Billing Endpoints

### `GET /api/user/wallet`
Fetches candidate wallet balance and transaction history. Supports ultra-fast lite queries.

- **Query Parameters**:
  - `lite`: `true` | `false`. If `true`, returns only `{ balance: number }` in <5ms without joining transaction history.
- **Success Response (`200 OK`)**:
  ```json
  {
    "balance": 150,
    "discountPercent": 10,
    "transactions": [
      {
        "id": "tx_01",
        "type": "TOPUP",
        "amount": 100,
        "paidAmount": 90,
        "description": "Top-up ₹100 (Paid ₹90 with 10% Discount)",
        "createdAt": "2026-10-27T10:00:00.000Z"
      }
    ]
  }
  ```

---

## 4. Webhook & Inbound Handlers

### `POST /api/payment/webhook`
Receives asynchronous payment and refund notifications from Razorpay.

- **Headers**:
  - `x-razorpay-signature`: Cryptographic HMAC SHA-256 signature calculated over raw body using `RAZORPAY_WEBHOOK_SECRET`.
- **Supported Events**:
  - `payment_link.paid`: Marks resume as `PAID` and unlocks full content.
  - `payment.failed`: Records failed billing attempt and notifies telemetry.
  - `payment_link.expired`: Reverts payment link state to expired.
  - `refund.processed`: Marks resume as `REFUNDED` and decrements user balance.
- **Success Response (`200 OK`)**: `{ "received": true }`

---

### `POST /api/resend/inbound`
Receives forwarded campus placement emails from Cloudflare Email Routing Workers.

- **Content-Type**: `application/json`
- **Payload Structure**:
  ```json
  {
    "to": "jd_user123@atslift.app",
    "from": "placement-cell@university.edu",
    "subject": "Campus Drive 2026 - Amazon SDE-1",
    "text": "Company: Amazon India\nRole: SDE-1\nCTC: 28 LPA...",
    "html": "<table>...</table>"
  }
  ```
- **Behavior**:
  1. Resolves candidate via `to` alias.
  2. Executes parallel eligibility check and ATS resume keyword scoring.
  3. Inserts `JobPosting` and schedules QStash reminders.
  4. Dispatches rich HTML alert to candidate's connected Telegram chat.
