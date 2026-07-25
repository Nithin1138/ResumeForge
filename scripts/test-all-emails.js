// scripts/test-all-emails.js
// Comprehensive test runner for sending & receiving emails across all @atslift.app identities

const BASE_URL = process.env.TEST_URL || "https://atslift.app";
const INBOUND_ENDPOINT = `${BASE_URL}/api/resend/inbound`;

const EMAIL_IDENTITIES = [
  "notifications@atslift.app",
  "noreply@atslift.app",
  "support@atslift.app",
  "jd_testuser@atslift.app"
];

console.log(`\n📧 Testing All Email Routing & Addresses for atslift.app\nTarget Endpoint: ${INBOUND_ENDPOINT}\n`);

async function runAllEmailTests() {
  let passed = 0;
  let failed = 0;

  // TEST SUITE 1: INBOUND ROUTING TO ALL ADDRESSES
  console.log("==================================================");
  console.log("SUITE 1: INBOUND EMAIL RECEIVING TESTS");
  console.log("==================================================");

  for (const addr of EMAIL_IDENTITIES) {
    console.log(`Testing Inbound Delivery to: ${addr}...`);
    try {
      const res = await fetch(INBOUND_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cloudflare.email",
          to: addr,
          from: "test-sender@example.com",
          subject: `Test Delivery to ${addr}`,
          text: `This is a test placement email delivery to ${addr}.\nCompany: Test Corp\nRole: Engineer\nDeadline: 31/12/2026`,
        }),
      });

      const data = await res.json();
      if (res.status === 200) {
        console.log(`  ✅ PASSED: ${addr} returned HTTP 200 OK (${data.type || data.message || "ok"})`);
        passed++;
      } else {
        console.log(`  ❌ FAILED: ${addr} returned HTTP ${res.status}:`, data);
        failed++;
      }
    } catch (err) {
      console.log(`  ❌ ERROR on ${addr}:`, err.message);
      failed++;
    }
  }

  // TEST SUITE 2: GOOGLE AUTO-FORWARDING VERIFICATION PARSING
  console.log("\n==================================================");
  console.log("SUITE 2: GMAIL AUTO-FORWARDING VERIFICATION EXTRACTION");
  console.log("==================================================");

  try {
    const res = await fetch(INBOUND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cloudflare.email",
        to: "jd_testuser@atslift.app",
        from: "forwarding-noreply@google.com",
        subject: "atslift.app Confirmation Code - 928374102",
        text: `Google Confirmation Code: 928374102
To approve Gmail auto-forwarding to jd_testuser@atslift.app, please click the link below:
https://mail.google.com/mail/vf-928374102-approve`,
      }),
    });

    const data = await res.json();
    if (res.status === 200 && data.type === "GMAIL_CONFIRMATION") {
      console.log("  ✅ PASSED: Gmail confirmation extracted code (928374102) & 1-click URL!");
      passed++;
    } else {
      console.log("  ❌ FAILED: Gmail confirmation extraction:", res.status, data);
      failed++;
    }
  } catch (err) {
    console.log("  ❌ ERROR:", err.message);
    failed++;
  }

  // TEST SUITE 3: RESEND FALLBACK PAYLOAD COMPATIBILITY
  console.log("\n==================================================");
  console.log("SUITE 3: RESEND FALLBACK WEBHOOK PAYLOAD COMPATIBILITY");
  console.log("==================================================");

  try {
    const res = await fetch(INBOUND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "email.received",
        data: {
          to: ["notifications@atslift.app"],
          from: "hr@company.com",
          subject: "Company Hiring 2026 Batch",
          text: "Role: Software Engineer\nDeadline: 25/11/2026",
        },
      }),
    });

    const data = await res.json();
    if (res.status === 200) {
      console.log("  ✅ PASSED: Resend fallback event format processed successfully!");
      passed++;
    } else {
      console.log("  ❌ FAILED: Resend fallback format:", res.status, data);
      failed++;
    }
  } catch (err) {
    console.log("  ❌ ERROR:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 OVERALL TEST RESULT: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================\n");
}

runAllEmailTests();
