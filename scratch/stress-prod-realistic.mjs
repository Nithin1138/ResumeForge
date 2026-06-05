/** Production single-user throughput (rate-limit aware: 13s between requests) */
const URL = "https://atslift.vercel.app/api/generate";
const DELAY_MS = 13_000;
const COUNT = 8;

const FORM = {
  personal: {
    fullName: "Stress Test User", email: "stress@test.com", collegeName: "VIT",
    branch: "CSE", graduationYear: "2026", cgpa: "8.5", targetRole: "Software Engineer",
    phone: "9999999999", linkedin: "", github: "", location: "India", hasPG: false,
  },
  skills: {
    categories: { languages: "Python, Java", frameworks: "React", tools: "Git", databases: "PostgreSQL", csConcepts: "DSA", aiAndData: "" },
    softSkills: "", certifications: "",
  },
  projects: [{ title: "Test", techStack: "React", description: "Test", keyResult: "Test", link: "", duration: "2025" }],
  internships: [], positions: [], achievements: [],
  options: { jobDescription: "", tone: "Professional & Formal", projectVariants: "1 version" },
};

async function one(i) {
  const t0 = performance.now();
  const res = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId: `prod-real-${Date.now()}-${i}`, formData: FORM }),
    signal: AbortSignal.timeout(90_000),
  });
  return { status: res.status, ms: performance.now() - t0, ok: res.ok };
}

const results = [];
console.log(`Production realistic: ${COUNT} requests, ${DELAY_MS / 1000}s spacing (single IP)\n`);
for (let i = 0; i < COUNT; i++) {
  const r = await one(i);
  results.push(r);
  console.log(`  #${i + 1}: ${r.status} in ${Math.round(r.ms)}ms`);
  if (i < COUNT - 1) await new Promise((r) => setTimeout(r, DELAY_MS));
}

const ok = results.filter((r) => r.ok);
const lat = ok.map((r) => r.ms).sort((a, b) => a - b);
const p50 = lat[Math.floor(lat.length / 2)] || 0;
const p95 = lat[Math.ceil(lat.length * 0.95) - 1] || 0;
const elapsedMin = ((COUNT - 1) * DELAY_MS + lat.reduce((a, b) => a + b, 0)) / 60_000;
const perMin = (ok.length / elapsedMin).toFixed(1);

console.log(`\nSuccess: ${ok.length}/${COUNT}`);
console.log(`Latency p50: ${Math.round(p50)}ms  p95: ${Math.round(p95)}ms`);
console.log(`Throughput: ${perMin}/min (~${Math.round(perMin * 60)}/hr) per real user IP`);
