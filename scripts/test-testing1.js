const INBOUND_ENDPOINT = "https://atslift.app/api/resend/inbound";

async function testBothRoutingFlows() {
  console.log("==================================================");
  console.log("🧪 TESTING FLOW 1: Mail addressed to personalprojects1009@gmail.com");
  console.log("==================================================");

  try {
    const res1 = await fetch(INBOUND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cloudflare.email",
        to: "personalprojects1009@gmail.com",
        delivered_to: "jd_cmq0ute70000@atslift.app",
        from: "cdc@vitapstudent.ac.in",
        subject: "TEST FLOW 1 - Gmail Forwarded Placement Drive",
        text: `Name of the Company: Google India
Category: Super Dream Placement
Eligible Branches: CSE, IT, ECE
Eligibility Criteria: 75% or 7.5 CGPA in Degree. No Standing Arrears.
Last date for Registration: 30th August 2026 (5:00 pm)`,
        html: `<table>
          <tr><td>Name of the Company</td><td>Google India</td></tr>
          <tr><td>Category</td><td>Super Dream Placement</td></tr>
          <tr><td>Eligible Branches</td><td>CSE, IT, ECE</td></tr>
          <tr><td>Eligibility Criteria</td><td>7.5 CGPA / 75%</td></tr>
          <tr><td>Last date for Registration</td><td>30th August 2026 (5:00 pm)</td></tr>
        </table>`,
      }),
    });

    const data1 = await res1.json();
    console.log("Flow 1 Result:", res1.status, data1);
    if (res1.status === 200 && data1.ok) {
      console.log("✅ FLOW 1 PASSED: Gmail forwarded mail (addressed to personalprojects1009@gmail.com) dispatched to Telegram!");
    } else {
      console.log("❌ FLOW 1 FAILED:", data1);
    }
  } catch (err) {
    console.error("Flow 1 Error:", err);
  }

  console.log("\n==================================================");
  console.log("🧪 TESTING FLOW 2: Mail addressed directly to jd_cmq0ute70000@atslift.app");
  console.log("==================================================");

  try {
    const res2 = await fetch(INBOUND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cloudflare.email",
        to: "jd_cmq0ute70000@atslift.app",
        from: "cdc@vitapstudent.ac.in",
        subject: "TEST FLOW 2 - Direct Alias Placement Drive",
        text: `Name of the Company: Microsoft India
Category: Super Dream Placement
Eligible Branches: All Branches
Eligibility Criteria: 8.0 CGPA
Last date for Registration: 15th September 2026 (10:00 am)`,
        html: `<table>
          <tr><td>Name of the Company</td><td>Microsoft India</td></tr>
          <tr><td>Category</td><td>Super Dream Placement</td></tr>
          <tr><td>Eligible Branches</td><td>All Branches</td></tr>
          <tr><td>Eligibility Criteria</td><td>8.0 CGPA</td></tr>
          <tr><td>Last date for Registration</td><td>15th September 2026 (10:00 am)</td></tr>
        </table>`,
      }),
    });

    const data2 = await res2.json();
    console.log("Flow 2 Result:", res2.status, data2);
    if (res2.status === 200 && data2.ok) {
      console.log("✅ FLOW 2 PASSED: Direct alias mail dispatched to Telegram!");
    } else {
      console.log("❌ FLOW 2 FAILED:", data2);
    }
  } catch (err) {
    console.error("Flow 2 Error:", err);
  }
}

testBothRoutingFlows();
