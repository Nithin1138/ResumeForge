import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | ATSLift",
  description: "Read the terms and conditions for using ATSLift.",
};

export default function TermsAndConditions() {
  return (
    <div dangerouslySetInnerHTML={{ __html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Terms &amp; Conditions — ATSLift</title>
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
    --tag-bg: #fff5eb;
    --tag-text: #b45309;
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
    background: #fffbeb;
    border-left: 3px solid #d97706;
    border-radius: 0 8px 8px 0;
    padding: 1rem 1.25rem;
    margin: 1.25rem 0;
  }

  .callout p {
    margin: 0;
    font-size: 0.875rem;
    color: #92400e;
  }

  .callout.info {
    background: #f0f4ff;
    border-left-color: var(--accent);
  }

  .callout.info p {
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
  <h1>Terms &amp; Conditions</h1>
  <p>Last updated: June 1, 2026 &nbsp;·&nbsp; Please read carefully before using ATSLift</p>
</div>

<div class="layout">
  <aside class="toc">
    <p>On this page</p>
    <a href="#agreement">Agreement</a>
    <a href="#service">The service</a>
    <a href="#eligibility">Eligibility</a>
    <a href="#payment">Payment</a>
    <a href="#refunds">Refunds</a>
    <a href="#content">Your content</a>
    <a href="#accuracy">Accuracy disclaimer</a>
    <a href="#ip">Intellectual property</a>
    <a href="#prohibited">Prohibited use</a>
    <a href="#liability">Liability</a>
    <a href="#termination">Termination</a>
    <a href="#governing">Governing law</a>
    <a href="#contact">Contact</a>
  </aside>

  <div class="content">

    <section id="agreement">
      <h2>Agreement to terms</h2>
      <p>These Terms and Conditions ("Terms") govern your use of ATSLift, operated by ATSLift Operations ("we", "us", "our"), accessible at <strong>atslift.vercel.app</strong>.</p>
      <p>By accessing or using ATSLift — including the Resume Builder, ATS Grader, or any other feature — you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree, do not use the service.</p>
    </section>

    <hr class="divider" />

    <section id="service">
      <h2>The service</h2>
      <p>ATSLift is an AI-powered resume content generator designed to help engineering students in India optimise their resumes for Applicant Tracking Systems (ATS) and recruiter review.</p>
      <p>The service consists of:</p>
      <ul>
        <li><strong>Resume Builder</strong> — a multi-step form that collects your academic and professional details and generates optimised bullet points, summaries, and skill listings</li>
        <li><strong>ATS Grader</strong> — a tool that analyses an uploaded PDF resume and produces a compatibility score and improvement suggestions</li>
      </ul>
      <p>ATSLift provides content and suggestions only. We do not submit, send, or directly interact with any employer, job portal, or placement system on your behalf.</p>
    </section>

    <hr class="divider" />

    <section id="eligibility">
      <h2>Eligibility</h2>
      <p>You must be at least 16 years old to use ATSLift. By using the service, you represent that you meet this age requirement.</p>
      <p>If you are using ATSLift on behalf of an institution or organisation, you represent that you have the authority to bind that entity to these Terms.</p>
    </section>

    <hr class="divider" />

    <section id="payment">
      <h2>Payment terms</h2>
      <p>ATSLift is free to start. You can fill in your details and view a preview of your generated content at no charge. A one-time payment of <strong>₹49 (Indian Rupees)</strong> is required to unlock the full copyable output.</p>
      <ul>
        <li>Payment is processed securely by <strong>Razorpay Software Private Limited</strong>.</li>
        <li>All prices are in Indian Rupees (INR) and inclusive of applicable taxes.</li>
        <li>Payment unlocks one resume generation, including up to 3 free regenerations (to adjust tone or align to a job description).</li>
        <li>This is a one-time charge per session, not a subscription.</li>
        <li>ATSLift reserves the right to change pricing with reasonable notice. Price changes will not affect payments already completed.</li>
      </ul>
    </section>

    <hr class="divider" />

    <section id="refunds">
      <h2>Refund policy</h2>
      <div class="callout">
        <p><strong>Key point:</strong> Because ATSLift delivers digital content immediately upon payment, refunds are generally not available once output has been generated and displayed.</p>
      </div>
      <p>We will issue a full refund in the following circumstances only:</p>
      <ul>
        <li>A technical failure on our end prevented your output from being generated after payment</li>
        <li>You were charged more than once for the same session due to a payment processing error</li>
      </ul>
      <p>To request a refund, email <a href="mailto:support@atslift.in">support@atslift.in</a> within <strong>48 hours</strong> of payment, including your transaction ID. We will investigate and respond within 3 business days.</p>
      <p>Refunds will be processed back to the original payment method within 5–7 business days, subject to Razorpay processing times.</p>
    </section>

    <hr class="divider" />

    <section id="content">
      <h2>Your content</h2>
      <p>You retain full ownership of the personal and professional information you enter into ATSLift. By submitting your content, you grant us a limited, non-exclusive, non-transferable licence to process that content for the sole purpose of generating your resume output.</p>
      <p>You are solely responsible for the accuracy of information you provide. Do not enter false qualifications, fabricated metrics, or invented work experience. ATSLift's purpose is to help you communicate your genuine skills more effectively, not to fabricate credentials.</p>
      <p>The generated output is provided for your personal use. You may copy, edit, and use it freely in your own resume documents.</p>
    </section>

    <hr class="divider" />

    <section id="accuracy">
      <h2>Accuracy disclaimer</h2>
      <p>ATSLift uses AI to generate resume content. While we strive for high-quality, accurate, and relevant output, we cannot guarantee that:</p>
      <ul>
        <li>Generated content will be free from errors, hallucinations, or inaccuracies</li>
        <li>Any resume output will result in interview calls, job offers, or shortlisting</li>
        <li>The ATS compatibility score will match scores from any specific employer's ATS system</li>
        <li>Suggested keywords will match any particular job description</li>
      </ul>
      <div class="callout info">
        <p>Always review and verify generated content before submitting to employers. You are responsible for the final accuracy of your resume.</p>
      </div>
      <p>ATSLift is a tool to assist you, not a guarantee of placement outcomes.</p>
    </section>

    <hr class="divider" />

    <section id="ip">
      <h2>Intellectual property</h2>
      <p>All content on the ATSLift website — including its design, copy, logos, UI components, and underlying code — is the property of ATSLift Operations and is protected by applicable intellectual property laws.</p>
      <p>You may not copy, reproduce, redistribute, or create derivative works from any part of the ATSLift platform without prior written permission.</p>
      <p>The AI-generated resume output produced from your inputs is licensed to you for personal use. ATSLift retains no claim over the final resume you create using this content.</p>
    </section>

    <hr class="divider" />

    <section id="prohibited">
      <h2>Prohibited use</h2>
      <p>You agree not to use ATSLift to:</p>
      <ul>
        <li>Fabricate qualifications, degrees, work experience, or achievements you do not possess</li>
        <li>Scrape, crawl, or extract content from the platform in bulk</li>
        <li>Attempt to reverse-engineer the AI prompts, models, or backend infrastructure</li>
        <li>Resell, repackage, or commercialise the generated content or the service itself</li>
        <li>Use the service for any unlawful purpose under Indian law or the laws of your jurisdiction</li>
        <li>Upload malicious files, code, or content via the PDF uploader</li>
        <li>Circumvent payment mechanisms to access unlocked content without paying</li>
      </ul>
      <p>Violations may result in immediate termination of access without refund and may be reported to relevant authorities.</p>
    </section>

    <hr class="divider" />

    <section id="liability">
      <h2>Limitation of liability</h2>
      <p>To the maximum extent permitted by applicable law, ATSLift Operations shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the service, including but not limited to:</p>
      <ul>
        <li>Loss of employment opportunity or career outcomes</li>
        <li>Rejection by employers, ATS systems, or placement portals</li>
        <li>Inaccuracies in AI-generated content that you rely upon</li>
        <li>Data loss due to technical failures</li>
      </ul>
      <p>Our total cumulative liability in connection with any claim relating to the service shall not exceed the amount you paid us (₹49) in the 30 days preceding the claim.</p>
      <p>The service is provided "as is" and "as available" without warranties of any kind, express or implied.</p>
    </section>

    <hr class="divider" />

    <section id="termination">
      <h2>Termination</h2>
      <p>We reserve the right to suspend or terminate your access to ATSLift at any time, without notice, if we believe you have violated these Terms or are misusing the service.</p>
      <p>You may stop using the service at any time. Termination does not entitle you to a refund unless the refund conditions in Section 5 are met.</p>
    </section>

    <hr class="divider" />

    <section id="governing">
      <h2>Governing law &amp; disputes</h2>
      <p>These Terms are governed by the laws of India. Any disputes arising from use of ATSLift shall be subject to the exclusive jurisdiction of the courts in <strong>Hyderabad, Telangana, India</strong>.</p>
      <p>Before initiating any formal dispute, we encourage you to contact us at <a href="mailto:support@atslift.in">support@atslift.in</a> so we can resolve the matter informally.</p>
    </section>

    <hr class="divider" />

    <section id="contact">
      <h2>Contact us</h2>
      <p>For any questions about these Terms, reach us at:</p>
      <p>
        <strong>ATSLift Operations</strong><br/>
        Email: <a href="mailto:support@atslift.in">support@atslift.in</a><br/>
        Response time: within 2 business days
      </p>
      <p>These Terms were last updated on <strong>June 1, 2026</strong> and supersede all prior versions.</p>
    </section>

  </div>
</div>

<div class="meta-footer">
  <p>© 2026 ATSLift Operations. All rights reserved.</p>
  <p><a href="/privacy">Privacy Policy</a> &nbsp;·&nbsp; <a href="/">Home</a> &nbsp;·&nbsp; <a href="/build">Build Resume</a></p>
</div>

</body>
</html>` }} />
  );
}
