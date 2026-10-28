# 🛡️ Security, Compliance & Rate Limiting — ATSLift

## 1. Overview of Security Posture

ATSLift handles sensitive student academic records, personal contact data, and financial transaction webhooks. The platform enforces security controls across **network boundaries**, **application logic**, **cryptographic signatures**, and **database isolation**.

---

## 2. Webhook Cryptographic Verification (HMAC SHA-256)

Payment events dispatched by payment gateways (Razorpay) are cryptographically validated to guarantee message integrity and prevent spoofed payment callbacks.

### Implementation Pattern:
```ts
// Extract raw webhook request body and incoming signature
const rawBody = await req.text();
const signature = req.headers.get("x-razorpay-signature");

// Compute expected HMAC SHA-256 digest
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
  .update(rawBody)
  .digest("hex");

// Timing-safe comparison to prevent side-channel timing attacks
const isValid = crypto.timingSafeEqual(
  Buffer.from(signature, "hex"),
  Buffer.from(expectedSignature, "hex")
);

if (!isValid) {
  logger.warn("Tampered or invalid webhook signature rejected", { ip });
  return NextResponse.json({ error: "Invalid cryptographic signature" }, { status: 400 });
}
```

- **Protection Against Replay & Tampering**: Any modification to order IDs, resume IDs, or amounts invalidates the signature immediately.
- **Constant-Time Comparison**: `crypto.timingSafeEqual` prevents execution time variance from leaking valid signature bytes.

---

## 3. Rate Limiting & Abuse Prevention

### A. IP-Based Sliding Window Rate Limiting
To protect public AI evaluation endpoints (such as `/api/ats-check`) from automated scraping or Denial of Service:
- **Algorithm**: In-memory sliding window bucket.
- **Threshold**: **10 requests per 60 seconds per client IP**.
- **Response Headers**: Returns HTTP `429 Too Many Requests` with a standard `Retry-After: <seconds>` header.
- **Memory Safety**: Automatic periodic pruning clears expired bucket entries when the map size exceeds 500 entries, preventing Node.js memory leaks.

### B. Daily User Quotas (Atomic Database Enforcement)
In addition to IP rate limiting, authenticated users have a daily quota on automated ATS resume scoring:
- **Daily Quota**: **10 checks per day**.
- **Atomic Counting**:
  ```ts
  const count = await prisma.atsScoreCheck.count({
    where: {
      userId,
      createdAt: { gte: startOfDayTimestamp },
    },
  });
  if (count >= 10) throw new QuotaExceededError("Daily limit reached.");
  ```

---

## 4. File Upload Sanitization & Security

Candidate resumes are parsed directly in server memory without writing unverified binary files to the host operating system disk:

1. **Strict File Size Limits**: Enforced at the boundary (`MAX_FILE_SIZE = 5 * 1024 * 1024` bytes / 5MB). Files exceeding this are rejected before invoking parsing libraries.
2. **Buffer-Only Processing**: PDF and DOCX files are parsed in-memory using `arrayBuffer()` and `Buffer.from()`. No executable files can be dropped into the server filesystem.
3. **MIME & Extension Whitelisting**: Strictly filters for `application/pdf`, `.pdf`, `.docx`, and standard Word processing MIME types.
4. **Stripping Active Content**: HTML outputs from `mammoth` strip embedded scripts and active tags (`replace(/<[^>]+>/g, " ")`).

---

## 5. Structured Observability & PII Redaction Suite

The centralized logger in [lib/logger.ts](../lib/logger.ts) and enterprise PII engine in [lib/pii.ts](../lib/pii.ts) sanitize all logs, analytics, and LLM audit pipelines to ensure candidate PII and credentials never leak into server telemetry or external APIs:

- **PII & Credential Redaction**: Automatically scrubs authentication secrets AND candidate personal identifiable information (emails, phone numbers, Aadhaar, SSN, tokens):
  ```json
  {
    "event": "user_action_logged",
    "email": "n***r@gmail.com",
    "phone": "+91 ******3210",
    "signature": "[REDACTED]",
    "token": "[REDACTED]"
  }
  ```
- **Blind ATS Evaluation & AI Privacy**:
  - In [lib/ats-scoring.ts](../lib/ats-scoring.ts), candidate profiles are anonymized (`anonymizeProfileForAts`) before generating prompt texts. Personal phone numbers, real emails, and profile links are masked, ensuring unbiased recruiter scoring and preventing candidate contact exposure to external AI models.
  - Job description forwarding cleaner ([lib/llm-extractor.ts](../lib/llm-extractor.ts)) automatically scrubs student contact info and roll numbers from forwarded placement emails.
- **Analytics Sanitization**:
  - In [app/api/analytics/events/route.ts](../app/api/analytics/events/route.ts), all event metadata is deep-sanitized with `sanitizeLogData` before persisting to `prisma.analyticsEvent`.
- **Error Categorization**: Distinguishes between expected client validation errors (HTTP 400) and critical system exceptions (HTTP 500), avoiding false alerts in Sentry or Datadog.

---

## 6. Authentication & Session Hardening

- **NextAuth.js JWT Sessions**: Sessions are stateless JWT tokens signed using a 256-bit cryptographic secret (`NEXTAUTH_SECRET`).
- **HTTP-Only Cookies**: Session cookies are configured with `HttpOnly: true` and `SameSite: lax` (or `strict`), preventing Cross-Site Scripting (XSS) token theft.
- **Secure Transport (HSTS)**: All production HTTP responses enforce `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` and `X-Content-Type-Options: nosniff` via [next.config.ts](../next.config.ts).
- **Isolated Vault Ownership**: All queries to `MasterProfile`, `Resume`, and `CoverLetter` filter strictly on `where: { userId: session.user.id }` to guarantee that candidates can never access another student's documents.
