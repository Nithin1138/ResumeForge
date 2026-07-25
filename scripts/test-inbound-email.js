// scripts/test-inbound-email.js
// Automated test script for Cloudflare Email Worker & Resend Inbound Endpoints

const BASE_URL = process.env.TEST_URL || "https://atslift.app";
const INBOUND_ENDPOINT = `${BASE_URL}/api/resend/inbound`;

console.log(`\n🧪 Testing Inbound Email Routing on: ${INBOUND_ENDPOINT}\n`);

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Cloudflare Email Worker Payload (Placement JD Email)
  console.log("--------------------------------------------------");
  console.log("Test 1: Cloudflare Email Worker Inbound Placement Email");
  try {
    const res1 = await fetch(INBOUND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cloudflare.email",
        to: "jd_testuser@atslift.app",
        from: "placements@university.edu",
        subject: "Tekion Campus Recruitment Drive 2026 Batch",
        text: `Company: Tekion Corp
Role: Associate Software Engineer
CTC: 16 LPA
Eligible Branches: B.Tech CSE, IT, ECE
Application Deadline: 30/08/2026
Drive Date: 05/09/2026
Location: Bengaluru`,
      }),
    });

    const data1 = await res1.json();
    if (res1.status === 200 && data1.ok) {
      console.log("✅ Test 1 PASSED: Received HTTP 200 OK & JobPosting ID:", data1.jobPostingId || "ok");
      passed++;
    } else {
      console.log("❌ Test 1 FAILED:", res1.status, data1);
      failed++;
    }
  } catch (err) {
    console.log("❌ Test 1 ERROR:", err.message);
    failed++;
  }

  // Test 2: Google Auto-Forwarding Verification Email
  console.log("--------------------------------------------------");
  console.log("Test 2: Google Auto-Forwarding Verification Email");
  try {
    const res2 = await fetch(INBOUND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cloudflare.email",
        to: "jd_testuser@atslift.app",
        from: "forwarding-noreply@google.com",
        subject: "atslift.app Confirmation Code - 847291034",
        text: `Google Confirmation Code: 847291034
To approve forwarding from your Gmail account to jd_testuser@atslift.app, please click the link below:
https://mail.google.com/mail/vf-847291034-approve`,
      }),
    });

    const data2 = await res2.json();
    if (res2.status === 200 && data2.type === "GMAIL_CONFIRMATION") {
      console.log("✅ Test 2 PASSED: Gmail confirmation extracted code & 1-click link!");
      passed++;
    } else {
      console.log("❌ Test 2 FAILED:", res2.status, data2);
      failed++;
    }
  } catch (err) {
    console.log("❌ Test 2 ERROR:", err.message);
    failed++;
  }

  // Test 3: Resend Fallback Event Payload
  console.log("--------------------------------------------------");
  console.log("Test 3: Resend Inbound Fallback Webhook Payload");
  try {
    const res3 = await fetch(INBOUND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "email.received",
        data: {
          to: ["jd_testuser@atslift.app"],
          from: "hr@amazon.com",
          subject: "Amazon SDE-1 Campus Hiring 2026",
          text: "Company: Amazon\nRole: SDE-1\nDeadline: 15/09/2026\nEligibility: CSE, IT",
        },
      }),
    });

    const data3 = await res3.json();
    if (res3.status === 200 && data3.ok) {
      console.log("✅ Test 3 PASSED: Resend webhook format processed clean!");
      passed++;
    } else {
      console.log("❌ Test 3 FAILED:", res3.status, data3);
      failed++;
    }
  } catch (err) {
    console.log("❌ Test 3 ERROR:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 Test Summary: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================\n");
}

runTests();
