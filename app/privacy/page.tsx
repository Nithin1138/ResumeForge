import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ATSLift",
  description: "Learn how ATSLift protects your resume data.",
};

export default function PrivacyPolicy() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Privacy Policy — ATSLift</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&family=DM+Serif+Display&display=swap" rel="stylesheet" />
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #fafaf8;
    --surface: #ffffff;
    --text: #1a1a18;
    --muted: #6b6b68;
    --accent: #1a4dd6;
    --border: #e8e8e4;
    --tag-bg: #eef2ff;
    --tag-text: #1a4dd6;
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--text);
    font-size: 16px;
    line-height: 1.75;
  }

  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.1rem 2rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .logo {
    font-family: 'DM Serif Display', serif;
    font-size: 1.35rem;
    color: var(--text);
    text-decoration: none;
    letter-spacing: -0.02em;
  }

  .nav-link {
    font-size: 0.875rem;
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }

  .hero {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 3.5rem 2rem 2.5rem;
    text-align: center;
  }

  .tag {
    display: inline-block;
    background: var(--tag-bg);
    color: var(--tag-text);
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 12px;
    border-radius: 100px;
    margin-bottom: 1.25rem;
  }

  .hero h1 {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(2rem, 5vw, 3rem);
    letter-spacing: -0.03em;
    line-height: 1.15;
    color: var(--text);
    margin-bottom: 0.75rem;
  }

  .hero p {
    color: var(--muted);
    font-size: 0.9375rem;
    max-width: 480px;
    margin: 0 auto;
  }

  .layout {
    max-width: 860px;
    margin: 0 auto;
    padding: 3rem 2rem 5rem;
    display: grid;
    grid-template-columns: 220px 1fr;
    gap: 3rem;
    align-items: start;
  }

  @media (max-width: 680px) {
    .layout { grid-template-columns: 1fr; gap: 2rem; }
    .toc { display: none; }
  }

  .toc {
    position: sticky;
    top: 72px;
  }

  .toc p {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 0.75rem;
  }

  .toc a {
    display: block;
    font-size: 0.8125rem;
    color: var(--muted);
    text-decoration: none;
    padding: 5px 0;
    border-left: 2px solid var(--border);
    padding-left: 12px;
    transition: color 0.15s, border-color 0.15s;
  }

  .toc a:hover {
    color: var(--accent);
    border-left-color: var(--accent);
  }

  .content section {
    margin-bottom: 2.75rem;
  }

  .content h2 {
    font-family: 'DM Serif Display', serif;
    font-size: 1.25rem;
    letter-spacing: -0.02em;
    color: var(--text);
    margin-bottom: 0.85rem;
    padding-top: 0.5rem;
  }

  .content p {
    color: #3d3d3a;
    font-size: 0.9375rem;
    margin-bottom: 0.85rem;
  }

  .content ul, .content ol {
    margin: 0.5rem 0 0.85rem 1.25rem;
  }

  .content li {
    color: #3d3d3a;
    font-size: 0.9375rem;
    margin-bottom: 0.4rem;
  }

  .callout {
    background: #f0f4ff;
    border-left: 3px solid var(--accent);
    border-radius: 0 8px 8px 0;
    padding: 1rem 1.25rem;
    margin: 1.25rem 0;
  }

  .callout p {
    margin: 0;
    font-size: 0.875rem;
    color: #2a3f9e;
  }

  .divider {
    border: none;
    border-top: 1px solid var(--border);
    margin: 2.75rem 0;
  }

  .meta-footer {
    background: var(--surface);
    border-top: 1px solid var(--border);
    padding: 2rem;
    text-align: center;
  }

  .meta-footer p {
    font-size: 0.8125rem;
    color: var(--muted);
    margin-bottom: 0.4rem;
  }

  .meta-footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }
</style>
</head>
<body>

<nav>
  <a class="logo" href="/">ATSLift</a>
  <a class="nav-link" href="/build">← Back to Builder</a>
</nav>

<div class="hero">
  <div class="tag">Legal</div>
  <h1>Privacy Policy</h1>
  <p>Last updated: June 1, 2026 &nbsp;·&nbsp; Effective immediately</p>
</div>

<div class="layout">
  <aside class="toc">
    <p>On this page</p>
    <a href="#overview">Overview</a>
    <a href="#collect">What we collect</a>
    <a href="#use">How we use it</a>
    <a href="#storage">Data storage</a>
    <a href="#sharing">Sharing</a>
    <a href="#payments">Payments</a>
    <a href="#cookies">Cookies</a>
    <a href="#rights">Your rights</a>
    <a href="#minors">Minors</a>
    <a href="#changes">Changes</a>
    <a href="#contact">Contact</a>
  </aside>

  <div class="content">

    <section id="overview">
      <h2>Overview</h2>
      <p>ATSLift ("we", "us", "our") operates the website <strong>atslift.vercel.app</strong> and associated services. This Privacy Policy explains how we collect, use, and protect your information when you use our resume-building and ATS optimization tools.</p>
      <p>By using ATSLift, you agree to the practices described in this policy. If you do not agree, please discontinue use of the service.</p>
      <div class="callout">
        <p><strong>Short version:</strong> We collect only what's necessary to generate your resume content. We do not sell your data. Resume content is processed in real-time and not permanently stored after generation.</p>
      </div>
    </section>

    <hr class="divider" />

    <section id="collect">
      <h2>What we collect</h2>
      <p>We collect the following categories of information:</p>
      <ul>
        <li><strong>Resume input data</strong> — name, email, phone number, college name, branch, CGPA, project descriptions, internship details, skills, and certifications that you voluntarily enter into the builder.</li>
        <li><strong>Uploaded files</strong> — PDF resumes uploaded to the ATS Grader feature for analysis.</li>
        <li><strong>Usage data</strong> — pages visited, time on site, browser type, device type, and IP address (collected automatically via standard server logs and analytics tools).</li>
        <li><strong>Payment metadata</strong> — transaction IDs and payment status via Razorpay. We do not receive or store card numbers or banking credentials.</li>
      </ul>
      <p>We do not collect government ID numbers, Aadhaar details, passwords (we have no login system), or sensitive personal categories like caste, religion, or health data.</p>
    </section>

    <hr class="divider" />

    <section id="use">
      <h2>How we use your information</h2>
      <p>The information you provide is used solely to:</p>
      <ol>
        <li>Generate ATS-optimized resume content based on your inputs</li>
        <li>Analyse uploaded resume PDFs and return an audit report</li>
        <li>Process and verify your ₹49 payment via Razorpay</li>
        <li>Send you your generated output (if email delivery is enabled)</li>
        <li>Improve our AI models and output quality (in anonymised, aggregated form only)</li>
        <li>Comply with legal obligations if required</li>
      </ol>
      <p>We do not use your resume data for advertising profiling, third-party lead generation, or any purpose unrelated to delivering the service you requested.</p>
    </section>

    <hr class="divider" />

    <section id="storage">
      <h2>Data storage & retention</h2>
      <p>Resume builder inputs are processed in real-time via our AI backend. <strong>We do not permanently store your raw resume inputs or generated outputs on our servers</strong> after your session ends, unless you explicitly save or request email delivery.</p>
      <p>Uploaded PDFs in the ATS Grader are processed immediately and deleted from our servers within 24 hours of upload.</p>
      <p>Server logs (IP, usage data) are retained for up to 90 days for security and debugging purposes, then automatically purged.</p>
      <p>Payment records are retained for 7 years as required by Indian financial regulations (GST compliance).</p>
    </section>

    <hr class="divider" />

    <section id="sharing">
      <h2>Sharing your data</h2>
      <p>We do not sell, rent, or trade your personal information. We may share data only in the following limited circumstances:</p>
      <ul>
        <li><strong>AI processing providers</strong> — your resume inputs are sent to our AI API provider (e.g. Anthropic) solely to generate your output. Their own privacy policies apply to this processing.</li>
        <li><strong>Razorpay</strong> — payment information is handled directly by Razorpay under their privacy policy.</li>
        <li><strong>Legal requirements</strong> — if compelled by law, court order, or to prevent fraud or harm.</li>
        <li><strong>Business transfer</strong> — in the event of a merger or acquisition, your data may transfer to the new entity under the same protections.</li>
      </ul>
    </section>

    <hr class="divider" />

    <section id="payments">
      <h2>Payments</h2>
      <p>All payments are processed by <strong>Razorpay Software Private Limited</strong>, a PCI-DSS compliant payment gateway. ATSLift does not receive, process, or store any card details, UPI credentials, or net banking information.</p>
      <p>Your payment of ₹49 is a one-time charge for unlocking your resume output. This is non-refundable once the content has been generated and displayed to you. If you experience a technical failure before receiving output, contact us within 48 hours for a resolution.</p>
    </section>

    <hr class="divider" />

    <section id="cookies">
      <h2>Cookies & tracking</h2>
      <p>We use minimal, functional cookies to:</p>
      <ul>
        <li>Maintain your session state as you move through the resume builder steps</li>
        <li>Remember your payment status so you can access your unlocked output</li>
      </ul>
      <p>We may use anonymised analytics tools (such as Google Analytics or a privacy-first alternative) to understand how users navigate the site. No personally identifiable information is included in analytics reports.</p>
      <p>You can disable cookies in your browser settings, but doing so may prevent the resume builder from functioning correctly.</p>
    </section>

    <hr class="divider" />

    <section id="rights">
      <h2>Your rights</h2>
      <p>Under applicable Indian privacy law (IT Act 2000 and the DPDP Act 2023), and where applicable GDPR, you have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data (subject to legal retention requirements)</li>
        <li>Withdraw consent for processing at any time</li>
        <li>Lodge a complaint with the relevant data protection authority</li>
      </ul>
      <p>To exercise any of these rights, email us at <a href="mailto:support@atslift.in">support@atslift.in</a>. We will respond within 30 days.</p>
    </section>

    <hr class="divider" />

    <section id="minors">
      <h2>Minors</h2>
      <p>ATSLift is intended for users who are 16 years of age or older. If you are below 16, please use this service only with the supervision and consent of a parent or guardian. We do not knowingly collect data from children under 13.</p>
    </section>

    <hr class="divider" />

    <section id="changes">
      <h2>Changes to this policy</h2>
      <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of ATSLift after changes constitutes your acceptance of the revised policy.</p>
      <p>For significant changes, we will display a notice on the homepage.</p>
    </section>

    <hr class="divider" />

    <section id="contact">
      <h2>Contact us</h2>
      <p>For any privacy-related questions, concerns, or data requests, contact us at:</p>
      <p>
        <strong>ATSLift Operations</strong><br/>
        Email: <a href="mailto:support@atslift.in">support@atslift.in</a><br/>
        Response time: within 2 business days
      </p>
    </section>

  </div>
</div>

<div class="meta-footer">
  <p>© 2026 ATSLift Operations. All rights reserved.</p>
  <p><a href="/terms">Terms &amp; Conditions</a> &nbsp;·&nbsp; <a href="/">Home</a> &nbsp;·&nbsp; <a href="/build">Build Resume</a></p>
</div>

</body>
</html>` }} />
  );
}
