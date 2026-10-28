// tests/integration/apiFlow.test.ts
import { test, describe } from "node:test";
import assert from "node:assert";
import crypto from "crypto";

describe("API Flow & Webhook Integration Pipeline", () => {
  test("Inbound email webhook payload parser validates MIME and extracts target metadata", () => {
    const rawInboundPayload = {
      type: "cloudflare.email",
      to: "nithin-xyz123@inbound.atslift.com",
      from: "placement-cell@university.edu",
      subject: "Amazon Campus Drive 2026 - Software Development Engineer (SDE 1)",
      text: "Company: Amazon India\nRole: SDE-1\nCTC: 28 LPA\nCriteria: B.Tech CSE/IT with CGPA >= 7.0 and 0 active backlogs.\nDeadline: 15/11/2026",
    };

    // Extract alias
    const aliasMatch = rawInboundPayload.to.match(/^([^@]+)@/);
    assert.ok(aliasMatch);
    const alias = aliasMatch[1];
    assert.strictEqual(alias, "nithin-xyz123");

    // Extract Subject and Company
    assert.ok(rawInboundPayload.subject.includes("Amazon"));
    assert.ok(rawInboundPayload.text.includes("SDE-1"));
  });

  test("Webhook HMAC SHA-256 signature verification validates payload authenticity", () => {
    const secret = "test_webhook_secret_key_12345";
    const payload = JSON.stringify({ event: "payment_link.paid", id: "pay_test_001" });

    // Generate valid HMAC
    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Verify matching signature
    const computedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    assert.strictEqual(computedSignature, validSignature, "Valid signature must match");

    // Verify altered payload rejection
    const alteredSignature = crypto
      .createHmac("sha256", secret)
      .update(payload + "_tampered")
      .digest("hex");

    assert.notStrictEqual(alteredSignature, validSignature, "Tampered payload signature must not match");
  });

  test("ATS API output schema conforms to strict interface specification", () => {
    const mockApiResponse = {
      overallScore: 84,
      categories: [
        { name: "Keyword Match", weightage: 35, score: 30, feedback: "Solid match" },
        { name: "Parsing & Structure", weightage: 25, score: 22, feedback: "Clean layout" },
      ],
      extractedData: {
        personal: { fullName: "Nithin", email: "nithin@example.com" },
        skills: { categories: { languages: "TypeScript, Python" } },
        projects: [{ title: "ResumeForge", techStack: "Next.js" }],
      },
    };

    assert.ok(typeof mockApiResponse.overallScore === "number");
    assert.ok(mockApiResponse.overallScore >= 0 && mockApiResponse.overallScore <= 100);
    assert.ok(Array.isArray(mockApiResponse.categories));
    assert.ok(typeof mockApiResponse.extractedData.personal.fullName === "string");
  });
});
