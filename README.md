# ATSLift — CGPA to ATS Resume Converter for Indian Engineering Students

ATSLift is an ultra-premium, production-ready full-stack web application built specifically for Indian engineering students (e.g. VIT, BITS, NITs, and IIITs) in placement season. 

It converts raw student academic data (CGPA, branch, projects, internships, club PORs) into recruiters-aligned, highly optimized ATS-compliant plain-text resume content utilizing generative LLMs.

---

## ⚡ Tech Stack

* **Frontend:** Next.js 16.2 (App Router, Turbopack, React 19)
* **Styling:** Tailwind CSS v4 (Warm Beige Light Nexus theme, dynamic micro-animations, glassmorphism)
* **Icons:** Lucide React
* **State Management:** Zustand v5
* **Form Validation:** React Hook Form + Zod resolvers
* **Database & ORM:** Prisma 7 + SQLite (highly portable driver adapter pattern using `better-sqlite3`)
* **AI Core:** Google Gemini 1.5/2.0 Flash APIs (wrapped via standard SDK)
* **Payment Gateway:** Razorpay Checkout & Link APIs (₹49 description link generation)
* **Transactional Email:** Resend SDK

---

## 🏗️ Architecture & Sandbox Modes

ATSLift is equipped with **zero-friction offline sandbox mechanisms**, enabling you to test the complete end-to-end generation, scorecard analysis, payment redirect, transaction webhook updates, and transactional email dispatches completely local without needing live API billing details.

1. **AI Generative Fallback (`lib/gemini.ts`):** If no `GEMINI_API_KEY` environment variable is detected, the API automatically triggers a simulated generative response that uses the student's actual form inputs to construct beautiful, quantified resume bullet points.
2. **Local Sandbox Checkout Bypass (`app/api/payment/create`):** If no `RAZORPAY_KEY_ID` is configured, checking out redirects the user to `/success/[resumeId]?sandbox=true`. This simulates payment links offline.
3. **Webhook Simulation Trigger (`app/success/[resumeId]`):** On loading with `sandbox=true`, the Success page issues a mock transaction POST notify to the local webhook listener `/api/payment/webhook`, setting the resume state in SQLite as PAID instantly.
4. **Resend Email Simulator (`lib/resend.ts`):** In the absence of a `RESEND_API_KEY`, the server logs the exact transactional email headers and plain-text output payload directly into the terminal console.

---

## 📂 Project Structure

```text
├── app/
│   ├── api/                   # API Route Handlers
│   │   ├── auth/              # Handles Magic Link / Google Sign-In cookies
│   │   ├── generate/          # Calls Gemini API / fallback to create resumes
│   │   ├── payment/           # Razorpay Order Links & Webhook handlers
│   │   ├── resume/            # Fetch/Delete specific resume records
│   │   └── user/              # Fetches resumes associated with active user
│   ├── about/                 # Static info and story page
│   ├── build/                 # 5-Step interactive wizard form
│   ├── dashboard/             # Student Saved Resumes & stats panel
│   ├── login/                 # Passwordless login and mock Google gate
│   ├── result/[resumeId]/     # Locked free preview score card
│   ├── success/[resumeId]/    # Confetti unlocked resume & PDF print page
│   ├── globals.css            # Tailwind custom v4 CSS theme & classes
│   └── layout.tsx             # Root layout with Satoshi & Instrument typography
├── lib/
│   ├── auth.ts                # Server session decoders & Prisma checks
│   ├── authClient.ts          # Dependency-free browser cookie parsers
│   ├── gemini.ts              # Gemini API integrations and mock engines
│   ├── prisma.ts              # Singleton Prisma client targeting better-sqlite3
│   └── resend.ts              # Resend email triggers and template dispatches
├── stores/
│   └── formStore.ts           # Zustand global state manager for step-wise data
├── types/
│   └── resume.ts              # TypeScript interfaces for student details
├── prisma/
│   ├── schema.prisma          # Prisma Schema with User, Resume, and Waitlist models
│   └── dev.db                 # Local SQLite database
└── package.json               # Package dependencies & build commands
```

---

## 🛠️ Getting Started

### 1. Installation
Clone the folder, navigate inside, and run standard dependency installers:
```bash
npm install
```

### 2. Migration
Generate local database tables and apply schema definitions inside SQLite:
```bash
npx prisma migrate dev --name init
```

### 3. Run Locally
Boot the Turbopack dev server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 E2E Local Sandbox Walkthrough Path

1. Open `/` (Landing page) and click **Build My Resume Free**.
2. Fill in step data (e.g. SDE target role, ECE branch, 8.9 CGPA, 1 project with a description).
3. Click **Generate Resume**. The screen transitions into an animated optimization load sequence.
4. You are redirected to `/result/[id]`. The page shows a beautiful circular **87 ATS Score gauge**, custom improvement checklist tips, and a partial preview. The rest of the sections are blurred.
5. Click **Unlock Full ATS Content**. Because Razorpay keys are omitted, the app issues a sandbox bypass and routes you to `/success/[id]?sandbox=true`.
6. Confetti explodes on the success page! The mock webhook triggers in the background, updating SQLite payment status to **PAID**.
7. Explore features: copy specific segments, copy the entire plain-text resume schema, download the `.txt` representation, adjust the tone and click **Re-Generate Content**, or select **Generate PDF Document** to inspect a print-optimized LaTeX-style page.
# ATSLift
