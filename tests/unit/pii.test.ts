import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  maskEmail,
  maskPhone,
  maskIdentifier,
  redactPiiFromText,
  sanitizeLogData,
  anonymizeProfileForAts,
  PII_SENSITIVE_KEYS,
} from "../../lib/pii";

describe("PII Redaction & Enterprise Data Masking", () => {
  describe("Email & Phone Masking", () => {
    it("masks standard emails preserving domain and edge characters", () => {
      assert.strictEqual(maskEmail("nithin.kumar@gmail.com"), "n***r@gmail.com");
      assert.strictEqual(maskEmail("hr.recruiter@company.co.in"), "h***r@company.co.in");
    });

    it("masks short local-part emails safely", () => {
      assert.strictEqual(maskEmail("me@domain.com"), "m*@domain.com");
    });

    it("handles null or invalid email inputs gracefully", () => {
      assert.strictEqual(maskEmail(null), "[EMAIL_REDACTED]");
      assert.strictEqual(maskEmail(""), "[EMAIL_REDACTED]");
      assert.strictEqual(maskEmail("not-an-email"), "[EMAIL_REDACTED]");
    });

    it("masks phone numbers preserving last 4 digits and country code", () => {
      assert.strictEqual(maskPhone("9876543210"), "******3210");
      assert.strictEqual(maskPhone("+91 9876543210"), "+91 ******3210");
      assert.strictEqual(maskPhone("+91-98765-43210"), "+91 ******3210");
    });

    it("handles short or empty phone inputs safely", () => {
      assert.strictEqual(maskPhone("12"), "[PHONE_REDACTED]");
      assert.strictEqual(maskPhone(null), "[PHONE_REDACTED]");
    });

    it("masks identifier strings like Telegram chat IDs", () => {
      assert.strictEqual(maskIdentifier("987654321"), "987***321");
      assert.strictEqual(maskIdentifier(null), "[ID_REDACTED]");
    });
  });

  describe("Text Stream PII Scrubber", () => {
    it("redacts raw emails and phone numbers from arbitrary text", () => {
      const raw = "Contact candidate at nithin@example.com or call +91 9876543210 for interview.";
      const scrubbed = redactPiiFromText(raw);
      assert.strictEqual(scrubbed.includes("nithin@example.com"), false);
      assert.strictEqual(scrubbed.includes("9876543210"), false);
      assert.strictEqual(scrubbed.includes("[EMAIL_REDACTED]"), true);
      assert.strictEqual(scrubbed.includes("[PHONE_REDACTED]"), true);
    });

    it("redacts Aadhaar and SSN numbers", () => {
      const text = "Aadhaar: 1234 5678 9012 and SSN: 123-45-6789";
      const scrubbed = redactPiiFromText(text);
      assert.strictEqual(scrubbed.includes("1234 5678 9012"), false);
      assert.strictEqual(scrubbed.includes("123-45-6789"), false);
      assert.strictEqual(scrubbed.includes("[AADHAAR_REDACTED]"), true);
      assert.strictEqual(scrubbed.includes("[SSN_REDACTED]"), true);
    });

    it("redacts Bearer tokens and authorization headers", () => {
      const text = "Request with Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.sig header";
      const scrubbed = redactPiiFromText(text);
      assert.strictEqual(scrubbed.includes("eyJhbGci"), false);
      assert.strictEqual(scrubbed.includes("Bearer [AUTH_TOKEN_REDACTED]"), true);
    });
  });

  describe("ATS Profile Anonymization", () => {
    it("strips personal contact identifiers while retaining technical and academic signals", () => {
      const rawProfile = {
        fullName: "Nithin Kumar",
        email: "nithin@example.com",
        phone: "+91 98765 43210",
        github: "https://github.com/Nithin1138",
        linkedin: "https://linkedin.com/in/nithin1138",
        college: "NIT",
        branch: "CSE",
        cgpa: "9.2",
        graduationYear: "2026",
        skillsJson: JSON.stringify(["TypeScript", "React", "PostgreSQL"]),
        projectsJson: JSON.stringify([{ title: "ResumeForge", desc: "AI Resume Builder" }]),
      };

      const anonymized = anonymizeProfileForAts(rawProfile);

      assert.strictEqual(anonymized.fullName, "Candidate (Anonymized for ATS Audit)");
      assert.strictEqual(anonymized.email, "[EMAIL_PROTECTED]");
      assert.strictEqual(anonymized.phone, "[PHONE_PROTECTED]");
      assert.strictEqual(anonymized.github, "https://github.com/[ANONYMIZED_USER]");
      assert.strictEqual(anonymized.linkedin, "https://linkedin.com/in/[ANONYMIZED_USER]");

      // Verify academic & technical signals are 100% preserved
      assert.strictEqual(anonymized.college, "NIT");
      assert.strictEqual(anonymized.branch, "CSE");
      assert.strictEqual(anonymized.cgpa, "9.2");
      assert.strictEqual(anonymized.graduationYear, "2026");
      assert.strictEqual(anonymized.skillsJson, rawProfile.skillsJson);
    });
  });

  describe("Deep Logger Data Sanitizer", () => {
    it("redacts sensitive keys including passwords, tokens, emails, and phones", () => {
      const rawContext = {
        user: {
          email: "student@college.edu",
          phone: "9876543210",
          password: "SuperSecretPassword123!",
          token: "session_token_abc_xyz",
        },
        metadata: {
          ip: "127.0.0.1",
          safeAction: "view_resume",
        },
      };

      const clean = sanitizeLogData(rawContext);

      assert.strictEqual(clean.user.password, "[REDACTED]");
      assert.strictEqual(clean.user.token, "[REDACTED]");
      assert.strictEqual(clean.user.email, "s***t@college.edu");
      assert.strictEqual(clean.user.phone, "******3210");
      assert.strictEqual(clean.metadata.safeAction, "view_resume");
    });

    it("verifies PII_SENSITIVE_KEYS contains all critical regulatory fields", () => {
      const expected = ["password", "token", "secret", "email", "phone", "aadhar", "ssn", "dob"];
      for (const field of expected) {
        assert.ok(
          PII_SENSITIVE_KEYS.some((k) => k.includes(field)),
          `PII_SENSITIVE_KEYS should include ${field}`
        );
      }
    });
  });
});
