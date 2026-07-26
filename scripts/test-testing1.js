const INBOUND_ENDPOINT = "https://atslift.app/api/resend/inbound";

async function testTesting1() {
  console.log("Testing testing 1 payload for jd_cmq0ute70000@atslift.app...");
  try {
    const res = await fetch(INBOUND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "cloudflare.email",
        to: "personalprojects1009@gmail.com",
        from: "nithin.23bce20064@vitapstudent.ac.in",
        subject: "testing 1",
        text: `Name of the Company: Uniq Core India
Category: Dream Core Internship
Date of Visit: Will be announced later
Eligible Branches: M.Tech Civil and related branches
Eligibility Criteria: % in X and XII - 60% or 6.0 CGPA in Pursuing Degree - 60% or 6.0 CGPA No Standing Arrears
CTC: Will be announced later
Stipend: Will be discussed during the interview
Last date for Registration: 25th July 2026 (2:00 pm)
Website: https://uniqcoreindia.com/`,
        html: `<table>
          <tr><td>Name of the Company</td><td>Uniq Core India</td></tr>
          <tr><td>Category</td><td>Dream Core Internship</td></tr>
          <tr><td>Eligible Branches</td><td>M.Tech Civil and related branches</td></tr>
          <tr><td>Eligibility Criteria</td><td>60% or 6.0 CGPA. No Standing Arrears.</td></tr>
          <tr><td>Last date for Registration</td><td>25th July 2026 (2:00 pm)</td></tr>
        </table>`,
      }),
    });

    const data = await res.json();
    console.log("Response:", res.status, data);
  } catch (err) {
    console.error("Error:", err);
  }
}

testTesting1();
