# 🎯 Live Demo & Evaluation Guide — ATSLift

This guide provides an end-to-end walkthrough script for recruiters, technical interviewers, and evaluators testing the ATSLift platform either locally or on the live deployment ([atslift.app](https://atslift.app)).

---

## 📋 Evaluation Checklist

- [ ] **Feature 1**: Instant ATS Score & Keyword Gap Audit (PDF / DOCX Upload)
- [ ] **Feature 2**: 5-Step AI Resume Builder with Real-Time Previews
- [ ] **Feature 3**: Sandbox Payment Unlock (`?sandbox=true`) & Single-Page PDF Export
- [ ] **Feature 4**: Personal Data Vault ("My Space") & AI Application Copilot
- [ ] **Feature 5**: Dual-Mode AI Cover Letter Generator (Mobile & Desktop)
- [ ] **Feature 6**: Autonomous Placement Email Ingestion & Instant Telegram Alerts
- [ ] **Feature 7**: Mobile Drawer & 1-Thumb Bottom Navigation Bar

---

## 🎬 Step-by-Step Walkthrough Script

### Step 1: Free ATS Resume Score & Keyword Gap Audit (`/ats-check`)
1. Navigate to `/ats-check`.
2. Upload any existing resume file (PDF or DOCX format under 5MB).
   - *Test Error Handling:* Try uploading an unsupported file or file >5MB to observe the student-friendly validation banner.
3. Observe the **Universal ATS Score** calculated out of 100 with category breakdowns:
   - Keyword Match (Weight: 35%)
   - Parsing & Layout Structure (Weight: 25%)
   - Technical Signal Strength (Weight: 20%)
   - Impact & Metrics Quantification (Weight: 10%)
   - Recruiter Readability (Weight: 7%)
   - Role Relevance (Weight: 3%)
4. Click **"Transfer Data to Resume Builder"** to pre-populate the 5-step form automatically.

---

### Step 2: 5-Step AI Resume Builder (`/build`)
1. Open `/build`.
2. Step through the intuitive wizard:
   - **Step 1 (Personal)**: Full name, target role, contact info, GitHub/LinkedIn links, coding handles.
   - **Step 2 (Education)**: College, branch, CGPA, graduation year.
   - **Step 3 (Skills Engine)**: Select branch (e.g. *Computer Science* or *Electronics*); observe smart categorized chip suggestions (Languages, Frameworks, Developer Tools, Databases, Core CS Concepts).
   - **Step 4 (Projects & Experience)**: Add projects with tech stacks and key achievements.
   - **Step 5 (Job Description & AI Tuning)**: Paste a target Job Description to trigger custom AI keyword tailoring.
3. Observe the real-time **A4 Live Wireframe Preview** updating dynamically as form inputs change.
4. Click **"Generate ATS Resume"** to initiate the AI generation pipeline.

---

### Step 3: Sandbox Payment Unlock (`/success/[resumeId]?sandbox=true`)
1. Upon generation, you arrive at the Teaser page with a masked preview.
2. Append `?sandbox=true` to the URL (or click the Sandbox button in developer mode).
3. The page initiates a background webhook simulation (`payment_link.paid`), verifying HMAC signatures and unlocking the resume instantly to status `PAID`.
4. Inspect the unlocked candidate document:
   - Formatted in an ATS-compliant, single-column typographical layout.
   - Click **"Download PDF"** to trigger a print preview optimized for standard A4 paper with zero multi-page spills.

---

### Step 4: Personal Data Vault & AI Copilot (`/my-space`)
1. Navigate to `/my-space`.
2. Inspect the **Personal Vault Tab**:
   - Master profile data (CGPA, active backlogs, projects, links) stored centrally.
   - **Pinned Quick-Copy Cards**: Click any pinned credential (e.g. CGPA, GitHub URL) to copy instantly to clipboard with tactile visual feedback.
3. Switch to the **AI Copilot Tab**:
   - Company portals often ask open-ended questions like *"Why should we hire you?"* or *"Describe your toughest technical project."*
   - Type any question into the input box and click **Ask AI Copilot**.
   - Observe the response: it grounds its answer **strictly in your real Vault profile and projects**, generating zero hallucinated claims.

---

### Step 5: AI Cover Letter Generator (`/mycover-letters`)
1. Open `/mycover-letters` or click **"Build Cover Letter"** from the Candidate Dashboard.
2. Enter target company name (*e.g., Stripe*) and target role (*e.g., Backend Systems Intern*).
3. Select desired tone (*e.g., Professional & Formal* or *Energetic & Startup*).
4. Click **"Generate Single-Page Cover Letter"**.
5. Test responsive views:
   - On Desktop: Side-by-side form and real-time live letter preview.
   - On Mobile: Observe the smooth segmented tab switcher (**Edit Application** vs **Live Preview**).
6. Click **"Copy Text"** or **"Download Single-Page PDF"**.

---

### Step 6: Autonomous Placement Email Automation (`/automations`)
1. Navigate to `/automations`.
2. Connect your Telegram account via deep-link to the bot (@BotFather token).
3. Copy your personal dedicated alias: `jd_<userId>@atslift.app`.
4. Run the email pipeline test simulation:
   ```bash
   npm run test:email:all
   ```
5. Check your Telegram chat:
   - Receive an instant rich HTML alert featuring company name (*e.g., Amazon India*), role, salary package (*28 LPA*), and eligibility criteria.
   - Tap inline callback buttons: **[Applied ✅]**, **[Skip ❌]**, or **[Update Resume 📄]**.

---

### Step 7: Mobile-First Navigation & Responsive Drawer
1. Resize your browser viewport to mobile width (`< 1024px`) or open Chrome DevTools Device Mode (iPhone / Pixel).
2. Tap the hamburger icon (3-lines) on the top left:
   - Observe the slide-out navigation drawer sliding in smoothly from the left.
   - Access **Dashboard**, **Resumes**, **Cover Letters**, **My Space**, **Wallet**, and **Sign Out**.
3. Inspect the **Bottom Navigation Bar**:
   - 1-tap switching between **Home**, **Resumes**, **Build (+)**, and **My Space**.
   - Notice proper padding at the bottom so no page content or action buttons are obscured.

---

## 🔧 Demo Troubleshooting & Quick Fixes

| Issue | Resolution |
| :--- | :--- |
| **No API Key Configured** | The app defaults to `GEMINI_API_KEY="mock"`, returning realistic offline synthetic responses so you can demo without internet or API keys. |
| **Payment Flow Blocked** | Append `?sandbox=true` to any `/success/[resumeId]` URL to bypass Razorpay and simulate successful webhook verification. |
| **Port Conflict** | Run `PORT=3001 npm run dev` if port 3000 is occupied. |
| **Database Connection Warning** | Run `curl http://localhost:3000/api/health` to verify that the PostgreSQL pool is connected and responding. |
