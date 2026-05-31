# ATSLift - Private Architecture & Workflow Documentation

This document provides an in-depth technical overview of the ATSLift application. It details the entire user workflow and explains how each feature is implemented in the codebase.

## 1. End-to-End User Workflow

1. **Landing Page (`/`)**: Users are introduced to the product and prompted to build their resume.
2. **Multi-Step Form (`/build`)**: Users enter their personal details, skills, projects, internships, and achievements across 5 interactive steps.
   - **Document Parsing**: Users can upload a PDF/DOCX. The file is sent to the backend (via `pdf2json` or `mammoth`) to auto-fill the form state.
   - **ATS & Keyword Optimization (Step 5)**: Users can paste a target Job Description, select a writing tone (e.g., Professional, Modern, Technical), and choose whether to generate multiple bullet variants for projects.
3. **Generation API (`/api/generate`)**: Upon form submission, the backend constructs a massive LLM prompt combining the user's inputs, skills engine results, and the Step 5 options. A new `Resume` record is saved in SQLite as `GENERATED` but `PENDING` payment.
4. **Scorecard & Free Preview (`/result/[resumeId]`)**: The user views a locked preview of their resume. They see their dynamically generated ATS score, custom improvement tips, and a blurred version of the full resume.
5. **Checkout & Webhooks (`/api/payment/*`)**: The user pays ₹49 via Razorpay. A webhook listener updates the database status to `PAID`.
   - *Sandbox Mode*: If keys are missing, the checkout bypasses Razorpay and redirects directly to success, simulating the webhook call locally.
6. **Success & Unlock (`/success/[resumeId]`)**: The user gains access to their full, unblurred resume. They can copy text, toggle project variants, regenerate specific sections, and print to PDF.

---

## 2. Feature Implementation Details

### Multi-Step Form Management
- **File:** `app/build/page.tsx`, `stores/formStore.ts`
- **Logic:** The form uses Zustand (`formStore.ts`) to persist data across page reloads and track the current active step. Validation is performed before allowing the user to proceed to the next step.

### ATS Score Calculation Logic (v2.0 SCORE ENGINE)
- **File:** `lib/gemini.ts`
- **Logic:** The ATS score is calculated deterministically by the LLM based on a strict fixed-weight formula (Total 100 Points). The prompt forces the AI to output a detailed category breakdown rather than randomly guessing a score.
- **The 6-Category Rubric:**
  1. **Keyword Match & Role Alignment (30 Points):** Evaluates presence of required technologies, domain terms, and job description alignment.
  2. **ATS Compatibility (25 Points):** Measures parsing reliability (usually scores high since ATSLift formats standard single-column text).
  3. **Technical Strength (15 Points):** Measures engineering depth, skill quality, and technology diversity.
  4. **Project Quality & Impact (15 Points):** Evaluates project complexity, technical implementation, and quantifiable metrics.
  5. **Recruiter Readability (10 Points):** Evaluates bullet structure, action verbs, and conciseness.
  6. **Experience & Credibility (5 Points):** Measures internships, certifications, and achievements.
- **Anti-Inflation Rules:** The prompt explicitly forbids the AI from assigning scores above 95 or below 40. Resumes lacking projects or internships must be capped between 40-60, while strong profiles with metrics reach 80-95.
- The LLM also generates lists of **Key Strengths**, **Weaknesses**, and actionable **Improvements**.

### Deterministic Skills Engine
- **File:** `lib/skillsEngine.ts`, `lib/gemini.ts`
- **Logic:** Instead of relying entirely on the LLM to format and group skills, the application runs the user's raw skill input through `generateTechnicalSkills()`. This deterministic engine logically groups skills into categories like "Programming Languages," "Frameworks," "Databases," and "Tools" before injecting them into the final LLM prompt and output. This prevents hallucinated skills.

### LLM Prompting & Resume Generation
- **File:** `lib/gemini.ts`
- **Logic:**
  - The system checks for a `GEMINI_API_KEY`. If present, it formats a highly specific JSON-enforced prompt demanding strictly ATS-safe language, engineer-grade terminology, and strong action verbs.
  - **Tone Adaptation**: The user's selection (e.g., "Professional & Formal") is passed directly into the prompt instructions.
  - **Keyword Alignment**: The user's pasted Job Description is appended to the prompt, instructing the LLM to weave those keywords naturally into the generated bullets.
  - **Project Variants**: If "3 versions for different roles" is selected, the LLM is instructed to output an array of `variants` (e.g., Frontend, Backend, Fullstack) for each project alongside the primary bullets.
  - **Fallback**: If Gemini fails, a high-performance Groq fallback engine attempts to use models like `llama-3.3-70b` or `mixtral`. If no API keys exist, a realistic offline mock generator is used.

### Partial Regeneration
- **File:** `app/api/generate-section/route.ts`, `app/success/[resumeId]/page.tsx`
- **Logic:** On the success page, users can click a "Regenerate" button next to a specific section (like a project or summary). This sends only that specific text chunk back to the LLM via `/api/generate-section`, asking it to rewrite that specific section to be more impactful. The React state (`liveResume`) is immediately updated with the new text.

### PDF Export
- **File:** `app/success/[resumeId]/page.tsx`
- **Logic:** The application uses browser-native printing (`window.print()`). The success page is styled with specific `print:hidden` and `print:block` Tailwind utility classes. When the print dialog opens, navigation bars and sidebars are hidden, and the `ResumePreviewPanel` expands to fill the standard A4 print format, ensuring a clean, LaTeX-style export without external PDF generation libraries.

### Webhook & Transaction Architecture
- **File:** `app/api/payment/webhook/route.ts`
- **Logic:** Razorpay triggers an event `payment_link.paid`. The webhook route parses the payload, validates the cryptographic signature, extracts the `resumeId` from the payment notes, and updates the Prisma SQLite database. It also logs a transaction record. The Success page polls the `/api/resume/[id]` endpoint until it detects `paymentStatus === "PAID"`, unlocking the content.
