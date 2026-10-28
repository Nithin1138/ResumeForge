/**
 * lib/pii.ts
 * Enterprise Personally Identifiable Information (PII) Redaction & Masking Suite
 * Supports GDPR, DPDP Act (India), and Blind Recruiter Audits.
 */

// Regex for Email Addresses (RFC 5322 compliant subset)
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;

// Regex for Phone Numbers (Indian 10-digit mobile, +91 prefixes, international E.164, spaced/dashed)
const PHONE_REGEX = /(?:\+?(\d{1,3})[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;

// Regex for Aadhaar numbers (12 digits, optional spaces/dashes every 4 digits)
const AADHAAR_REGEX = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g;

// Regex for US Social Security Numbers (SSN: 9 digits in 3-2-4 format)
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;

// Regex for Authorization Bearer Tokens & API Keys
const AUTH_TOKEN_REGEX = /(?:Bearer\s+)[A-Za-z0-9\-_=]+\.[A-Za-z0-9\-_=]+\.?[A-Za-z0-9\-_.+/=]*/gi;

// Sensitive Object Keys that must ALWAYS be redacted in logs and storage contexts
export const PII_SENSITIVE_KEYS: readonly string[] = [
  // Authentication & Secrets
  "password",
  "secret",
  "token",
  "apikey",
  "api_key",
  "authorization",
  "cookie",
  "gemini_api_key",
  "nextauth_secret",
  "signature",
  // Personal Identifiable Information (PII)
  "email",
  "candidateemail",
  "useremail",
  "phone",
  "mobile",
  "phonenumber",
  "telephone",
  "address",
  "aadhar",
  "aadhaar",
  "ssn",
  "pan",
  "passport",
  "dob",
  "dateofbirth",
  "birthdate",
  "creditcard",
  "cardnumber",
  "cvv",
];

/**
 * Partially masks an email address for safe logging/display.
 * e.g. "nithin.kumar@gmail.com" -> "n***r@gmail.com"
 * e.g. "ab@domain.com" -> "a*@domain.com"
 */
export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return "[EMAIL_REDACTED]";
  }
  const [local, domain] = email.trim().split("@");
  if (!local || !domain) return "[EMAIL_REDACTED]";

  let maskedLocal: string;
  if (local.length <= 2) {
    maskedLocal = `${local[0]}*`;
  } else {
    maskedLocal = `${local[0]}***${local[local.length - 1]}`;
  }
  return `${maskedLocal}@${domain}`;
}

/**
 * Partially masks a phone number for safe logging.
 * e.g. "+91 9876543210" -> "+91 ******3210"
 * e.g. "9876543210" -> "******3210"
 */
export function maskPhone(phone?: string | null): string {
  if (!phone || typeof phone !== "string") {
    return "[PHONE_REDACTED]";
  }
  const clean = phone.trim();
  const digits = clean.replace(/\D/g, "");
  if (digits.length < 4) return "[PHONE_REDACTED]";

  const last4 = digits.slice(-4);
  const prefix = clean.startsWith("+") ? "+91 " : "";
  return `${prefix}******${last4}`;
}

/**
 * Masks an identifier (like Telegram Chat ID or internal reference)
 * e.g. "1234567890" -> "123***890"
 */
export function maskIdentifier(id?: string | number | null): string {
  if (!id) return "[ID_REDACTED]";
  const str = String(id).trim();
  if (str.length <= 4) return "****";
  const start = str.slice(0, 3);
  const end = str.slice(-3);
  return `${start}***${end}`;
}

/**
 * Comprehensive PII Scrubber for raw text streams.
 * Replaces emails, phone numbers, Aadhaar, SSN, and Bearer tokens with safe tags.
 */
export function redactPiiFromText(text: string, options?: { maskOnly?: boolean }): string {
  if (!text || typeof text !== "string") return "";

  let result = text;

  // 1. Redact Authorization / Bearer tokens
  result = result.replace(AUTH_TOKEN_REGEX, "Bearer [AUTH_TOKEN_REDACTED]");

  // 2. Redact Emails
  if (options?.maskOnly) {
    result = result.replace(EMAIL_REGEX, (match) => maskEmail(match));
  } else {
    result = result.replace(EMAIL_REGEX, "[EMAIL_REDACTED]");
  }

  // 3. Redact Social Security Numbers (SSN)
  result = result.replace(SSN_REGEX, "[SSN_REDACTED]");

  // 4. Redact Indian Aadhaar numbers
  result = result.replace(AADHAAR_REGEX, "[AADHAAR_REDACTED]");

  // 5. Redact Phone numbers
  if (options?.maskOnly) {
    result = result.replace(PHONE_REGEX, (match) => maskPhone(match));
  } else {
    result = result.replace(PHONE_REGEX, "[PHONE_REDACTED]");
  }

  return result;
}

/**
 * Deep object sanitizer for logs and analytics metadata.
 * Masks sensitive keys and scrubs PII from string values.
 */
export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data;
  if (typeof data !== "object") {
    if (typeof data === "string") {
      // If the string itself contains auth tokens, passwords, or emails, scrub them
      if (data.includes("@") || data.toLowerCase().includes("bearer")) {
        return redactPiiFromText(data, { maskOnly: true });
      }
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    const isSensitive = PII_SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));

    if (isSensitive) {
      if (key.toLowerCase().includes("email") && typeof val === "string") {
        clean[key] = maskEmail(val);
      } else if (key.toLowerCase().includes("phone") && typeof val === "string") {
        clean[key] = maskPhone(val);
      } else {
        clean[key] = "[REDACTED]";
      }
    } else if (typeof val === "object") {
      clean[key] = sanitizeLogData(val);
    } else if (typeof val === "string") {
      clean[key] = redactPiiFromText(val, { maskOnly: true });
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

/**
 * Creates an Anonymized Profile for ATS Evaluation & LLM Prompts.
 * Strips personal contact identifiers (Name, Email, Phone, private links)
 * while 100% preserving technical signals (CGPA, Branch, Skills, Projects, Experience).
 */
export function anonymizeProfileForAts(profile: any): any {
  if (!profile || typeof profile !== "object") return profile;

  return {
    ...profile,
    fullName: "Candidate (Anonymized for ATS Audit)",
    email: "[EMAIL_PROTECTED]",
    phone: "[PHONE_PROTECTED]",
    // Protect personal profile usernames while preserving link presence for ATS ranking
    github: profile.github ? "https://github.com/[ANONYMIZED_USER]" : null,
    linkedin: profile.linkedin ? "https://linkedin.com/in/[ANONYMIZED_USER]" : null,
    portfolio: profile.portfolio ? "https://[ANONYMIZED_PORTFOLIO].dev" : null,
    // Preserve all academic & professional signals without personal addresses
    college: profile.college || "Engineering College",
    branch: profile.branch || "Computer Science / Engineering",
    cgpa: profile.cgpa,
    graduationYear: profile.graduationYear,
    activeBacklogs: profile.activeBacklogs,
    backlogHistory: profile.backlogHistory,
    academicGapYears: profile.academicGapYears,
    noticePeriod: profile.noticePeriod,
    summary: profile.summary ? redactPiiFromText(profile.summary) : "",
    skillsJson: profile.skillsJson,
    projectsJson: profile.projectsJson ? redactPiiFromText(profile.projectsJson) : "[]",
    experiencesJson: profile.experiencesJson ? redactPiiFromText(profile.experiencesJson) : "[]",
    educationJson: profile.educationJson,
  };
}
