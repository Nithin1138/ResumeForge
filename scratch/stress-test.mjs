/**
 * ATSLift API stress test — ramp-up, sustained, and upper-limit discovery
 *
 * Usage:
 *   node scratch/stress-test.mjs                          # local only
 *   node scratch/stress-test.mjs --both                   # local + production
 *   BASE_URL=https://atslift.vercel.app node scratch/stress-test.mjs
 *
 * Env:
 *   SUSTAIN_SEC=60          sustained phase duration
 *   MAX_CONCURRENCY=50      ramp ceiling
 *   MAX_TOTAL_REQUESTS=500  hard cap per environment
 *   REQUEST_TIMEOUT_MS=90000
 */

const LOCAL_URL = process.env.LOCAL_URL || "http://localhost:3000";
const PROD_URL = process.env.PROD_URL || "https://atslift.vercel.app";
const RUN_BOTH = process.argv.includes("--both");
const SUSTAIN_SEC = Number(process.env.SUSTAIN_SEC || 60);
const MAX_CONCURRENCY = Number(process.env.MAX_CONCURRENCY || 50);
const MAX_TOTAL_REQUESTS = Number(process.env.MAX_TOTAL_REQUESTS || 500);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 90_000);
const ERROR_RATE_STOP = Number(process.env.ERROR_RATE_STOP || 0.25);

const RAMP_STEPS = [1, 5, 10, 15, 20, 25, 30, 40, 50]
  .filter((n) => n <= MAX_CONCURRENCY);

const SAMPLE_FORM = {
  personal: {
    fullName: "Stress Test User",
    email: "stress@test.com",
    collegeName: "VIT",
    branch: "CSE",
    graduationYear: "2026",
    cgpa: "8.5",
    targetRole: "Software Engineer",
    phone: "9999999999",
    linkedin: "",
    github: "github.com/stress",
    location: "India",
    hasPG: false,
  },
  skills: {
    categories: {
      languages: "Python, Java, JavaScript",
      frameworks: "React, Next.js, FastAPI",
      tools: "Git, Docker, AWS",
      databases: "PostgreSQL, MongoDB",
      csConcepts: "DSA, OOP, DBMS",
      aiAndData: "Machine Learning",
    },
    softSkills: "",
    certifications: "",
  },
  projects: [
    {
      title: "Load Test Portal",
      techStack: "React, Node.js, PostgreSQL",
      description: "Built a dashboard for monitoring API throughput",
      keyResult: "Handled 500 concurrent users with 99% uptime",
      link: "",
      duration: "Jan 2025 – Mar 2025",
    },
  ],
  internships: [],
  positions: [],
  achievements: [],
  options: {
    jobDescription: "",
    tone: "Professional & Formal",
    projectVariants: "1 version",
  },
};

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function summarize(results, label, durationMs) {
  const latencies = results.filter((r) => r.ok).map((r) => r.elapsed).sort((a, b) => a - b);
  const success = results.filter((r) => r.ok).length;
  const rateLimited = results.filter((r) => r.status === 429).length;
  const timeouts = results.filter((r) => r.status === 0).length;
  const serverErrors = results.filter((r) => r.status >= 500).length;
  const otherErrors = results.filter((r) => !r.ok && r.status !== 429 && r.status !== 0).length;
  const total = results.length;
  const durationSec = durationMs / 1000;
  const rps = durationSec > 0 ? success / durationSec : 0;

  const statusBreakdown = {};
  for (const r of results) {
    const key = r.status || "timeout";
    statusBreakdown[key] = (statusBreakdown[key] || 0) + 1;
  }

  return {
    label,
    total,
    success,
    rateLimited,
    timeouts,
    serverErrors,
    otherErrors,
    errors: total - success,
    successRate: total ? ((success / total) * 100).toFixed(1) + "%" : "0%",
    perSecond: rps.toFixed(3),
    perMinute: (rps * 60).toFixed(1),
    perHour: Math.round(rps * 3600),
    latencyMs: {
      p50: percentile(latencies, 50).toFixed(0),
      p95: percentile(latencies, 95).toFixed(0),
      p99: percentile(latencies, 99).toFixed(0),
      min: latencies[0]?.toFixed(0) ?? "—",
      max: latencies[latencies.length - 1]?.toFixed(0) ?? "—",
    },
    statusBreakdown,
  };
}

function printReport(r) {
  console.log(`\n【${r.label}】`);
  console.log(`  Requests:     ${r.success}/${r.total} success (${r.successRate})`);
  console.log(`  429 limited:  ${r.rateLimited}  |  5xx: ${r.serverErrors}  |  timeouts: ${r.timeouts}  |  other: ${r.otherErrors}`);
  console.log(`  Throughput:   ${r.perSecond}/sec  |  ${r.perMinute}/min  |  ~${r.perHour}/hr`);
  console.log(`  Latency (ms): p50=${r.latencyMs.p50}  p95=${r.latencyMs.p95}  p99=${r.latencyMs.p99}  min=${r.latencyMs.min}  max=${r.latencyMs.max}`);
  if (Object.keys(r.statusBreakdown).length) {
    console.log(`  Status codes: ${JSON.stringify(r.statusBreakdown)}`);
  }
}

async function healthCheck(baseUrl) {
  try {
    const res = await fetch(baseUrl, { signal: AbortSignal.timeout(8000) });
    return res.ok || res.status === 304;
  } catch {
    return false;
  }
}

function makeClient(baseUrl, envLabel) {
  const endpoint = `${baseUrl}/api/generate`;
  let ipCounter = envLabel === "production" ? 50_000 : 1_000;
  let totalRequests = 0;

  async function generateOnce(ipSuffix, sessionSuffix, sameIp = false) {
    if (totalRequests >= MAX_TOTAL_REQUESTS) {
      return { status: -1, elapsed: 0, ok: false, body: { error: "MAX_TOTAL_REQUESTS cap" }, capped: true };
    }
    totalRequests += 1;

    const start = performance.now();
    const ip = sameIp
      ? "10.0.0.1"
      : `10.${Math.floor(ipSuffix / 65536) % 256}.${Math.floor(ipSuffix / 256) % 256}.${ipSuffix % 256}`;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-for": ip,
        },
        body: JSON.stringify({
          sessionId: `stress-${envLabel}-${sessionSuffix}-${Date.now()}`,
          formData: SAMPLE_FORM,
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const elapsed = performance.now() - start;
      let body = {};
      try {
        body = await res.json();
      } catch {
        body = {};
      }
      return { status: res.status, elapsed, ok: res.ok, body };
    } catch (err) {
      return {
        status: 0,
        elapsed: performance.now() - start,
        ok: false,
        body: { error: err.message },
      };
    }
  }

  async function runConcurrent(count, ipOffset = 0) {
    const start = performance.now();
    const results = await Promise.all(
      Array.from({ length: count }, (_, i) => {
        if (totalRequests >= MAX_TOTAL_REQUESTS) {
          return Promise.resolve({ status: -1, elapsed: 0, ok: false, body: {}, capped: true });
        }
        return generateOnce(ipOffset + i + 1, `c${count}-${i}`);
      })
    );
    return { results: results.filter((r) => !r.capped), durationMs: performance.now() - start };
  }

  async function runSustained(durationSec, concurrency) {
    const deadline = Date.now() + durationSec * 1000;
    const results = [];
    const start = performance.now();

    async function worker(workerId) {
      while (Date.now() < deadline && totalRequests < MAX_TOTAL_REQUESTS) {
        ipCounter += 1;
        const r = await generateOnce(ipCounter, `w${workerId}-${ipCounter}`);
        if (r.capped) break;
        results.push(r);
      }
    }

    await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i)));
    return { results, durationMs: performance.now() - start };
  }

  return { generateOnce, runConcurrent, runSustained, getTotalRequests: () => totalRequests };
}

async function runFullSuite(baseUrl, envLabel) {
  console.log("\n" + "█".repeat(64));
  console.log(`  ENVIRONMENT: ${envLabel.toUpperCase()} — ${baseUrl}`);
  console.log("█".repeat(64));

  const up = await healthCheck(baseUrl);
  if (!up) {
    console.error(`❌ ${envLabel} not reachable at ${baseUrl}`);
    return null;
  }
  console.log(`✅ ${envLabel} is up`);
  console.log(`   Caps: MAX_CONCURRENCY=${MAX_CONCURRENCY}, SUSTAIN=${SUSTAIN_SEC}s, MAX_REQUESTS=${MAX_TOTAL_REQUESTS}, TIMEOUT=${REQUEST_TIMEOUT_MS}ms\n`);

  const client = makeClient(baseUrl, envLabel);
  const reports = [];
  let maxStableConcurrency = 1;

  // Phase 1: baseline
  console.log("▶ Phase 1: Baseline (1 request)...");
  const baseline = await client.runConcurrent(1);
  reports.push(summarize(baseline.results, "Baseline ×1", baseline.durationMs));
  console.log(`   ${baseline.results[0]?.ok ? "OK" : "FAIL"} ${baseline.results[0]?.status} in ${baseline.results[0]?.elapsed?.toFixed(0)}ms\n`);

  // Phase 2: rate limit (same IP)
  console.log("▶ Phase 2: Rate limit probe (10 sequential, same IP)...");
  const rateStart = performance.now();
  const rateResults = [];
  for (let i = 0; i < 10; i++) {
    const r = await client.generateOnce(1, `rate-${i}`, true);
    if (r.capped) break;
    rateResults.push(r);
  }
  reports.push(summarize(rateResults, "Rate limit (same IP ×10)", performance.now() - rateStart));
  console.log(`   OK: ${rateResults.filter((r) => r.ok).length}, 429: ${rateResults.filter((r) => r.status === 429).length}\n`);

  // Phase 3: ramp-up to find upper concurrency limit
  console.log("▶ Phase 3: Concurrency ramp-up (find upper stable limit)...");
  for (const n of RAMP_STEPS) {
    const burst = await client.runConcurrent(n, n * 100);
    const report = summarize(burst.results, `Ramp ×${n}`, burst.durationMs);
    reports.push(report);
    const errorRate = burst.results.length ? (burst.results.length - report.success) / burst.results.length : 1;
    const ok = report.success;
    console.log(`   ×${n}: ${ok}/${burst.results.length} OK, p50=${report.latencyMs.p50}ms, ${report.perSecond}/s, errRate=${(errorRate * 100).toFixed(0)}%`);

    if (errorRate <= ERROR_RATE_STOP && ok > 0) {
      maxStableConcurrency = n;
    } else {
      console.log(`   ⚠ Stopping ramp — error rate exceeded ${ERROR_RATE_STOP * 100}% at ×${n}`);
      break;
    }
  }
  console.log(`   → Max stable concurrency: ×${maxStableConcurrency}\n`);

  // Phase 4: sustained at max stable concurrency
  const sustainConcurrency = Math.min(maxStableConcurrency, envLabel === "production" ? 15 : maxStableConcurrency);
  console.log(`▶ Phase 4: Sustained load (${SUSTAIN_SEC}s, ${sustainConcurrency} workers, rotating IPs)...`);
  const sustained = await client.runSustained(SUSTAIN_SEC, sustainConcurrency);
  reports.push(summarize(sustained.results, `Sustained ${SUSTAIN_SEC}s ×${sustainConcurrency}`, sustained.durationMs));
  console.log(`   Completed ${sustained.results.length} requests (total sent: ${client.getTotalRequests()})\n`);

  // Phase 5: spike above limit (optional)
  const spikeN = Math.min(maxStableConcurrency + 10, MAX_CONCURRENCY);
  if (spikeN > maxStableConcurrency) {
    console.log(`▶ Phase 5: Spike test (×${spikeN}, above stable limit)...`);
    const spike = await client.runConcurrent(spikeN, spikeN * 200);
    reports.push(summarize(spike.results, `Spike ×${spikeN}`, spike.durationMs));
    console.log(`   ${spike.results.filter((r) => r.ok).length}/${spike.results.length} OK\n`);
  }

  const sustainedReport = reports.find((r) => r.label.startsWith("Sustained"));
  const rampBest = reports.filter((r) => r.label.startsWith("Ramp")).sort((a, b) => Number(b.perSecond) - Number(a.perSecond))[0];

  const summary = {
    environment: envLabel,
    baseUrl,
    maxStableConcurrency,
    sustainConcurrency,
    totalRequests: client.getTotalRequests(),
    sustainedPerSec: sustainedReport?.perSecond,
    sustainedPerMin: sustainedReport?.perMinute,
    sustainedPerHour: sustainedReport?.perHour,
    peakBurstPerSec: rampBest?.perSecond,
    baselineLatencyP50: reports[0]?.latencyMs.p50,
    sustainedLatencyP50: sustainedReport?.latencyMs.p50,
    sustainedLatencyP95: sustainedReport?.latencyMs.p95,
    reports,
  };

  console.log("─".repeat(64));
  console.log(`  ${envLabel.toUpperCase()} CAPACITY SUMMARY`);
  console.log("─".repeat(64));
  console.log(`  Max stable concurrency:  ×${maxStableConcurrency}`);
  console.log(`  Sustained throughput:    ~${sustainedReport?.perSecond}/sec (~${sustainedReport?.perMinute}/min, ~${sustainedReport?.perHour}/hr)`);
  console.log(`  Peak burst throughput:   ~${rampBest?.perSecond}/sec (at ${rampBest?.label})`);
  console.log(`  Latency (sustained):     p50=${sustainedReport?.latencyMs.p50}ms  p95=${sustainedReport?.latencyMs.p95}ms`);
  console.log(`  Per-user rate limit:     5 req/min/IP`);
  console.log(`  Total requests sent:     ${client.getTotalRequests()}`);

  for (const r of reports) printReport(r);

  return summary;
}

function printComparison(local, prod) {
  console.log("\n" + "═".repeat(64));
  console.log("  LOCAL vs PRODUCTION COMPARISON");
  console.log("═".repeat(64));
  if (!local || !prod) {
    console.log("  (skipped — one or both environments unavailable)");
    return;
  }

  const rows = [
    ["Max stable concurrency", `×${local.maxStableConcurrency}`, `×${prod.maxStableConcurrency}`],
    ["Sustained req/sec", local.sustainedPerSec, prod.sustainedPerSec],
    ["Sustained req/min", local.sustainedPerMin, prod.sustainedPerMin],
    ["Sustained req/hr", local.sustainedPerHour, prod.sustainedPerHour],
    ["Peak burst req/sec", local.peakBurstPerSec, prod.peakBurstPerSec],
    ["Baseline p50 (ms)", local.baselineLatencyP50, prod.baselineLatencyP50],
    ["Sustained p50 (ms)", local.sustainedLatencyP50, prod.sustainedLatencyP50],
    ["Sustained p95 (ms)", local.sustainedLatencyP95, prod.sustainedLatencyP95],
    ["Total requests", local.totalRequests, prod.totalRequests],
  ];

  console.log("\n  Metric                    Local           Production");
  console.log("  " + "─".repeat(58));
  for (const [metric, l, p] of rows) {
    console.log(`  ${metric.padEnd(26)} ${String(l).padEnd(15)} ${p}`);
  }

  const localRps = Number(local.sustainedPerSec);
  const prodRps = Number(prod.sustainedPerSec);
  if (localRps > 0 && prodRps > 0) {
    const ratio = (prodRps / localRps).toFixed(2);
    console.log(`\n  Production/local throughput ratio: ${ratio}x`);
    if (prodRps < localRps * 0.5) {
      console.log("  → Production is significantly slower (expected: live LLM + serverless cold starts)");
    }
  }
}

async function main() {
  const targets = RUN_BOTH
    ? [
        { url: LOCAL_URL, label: "local" },
        { url: PROD_URL, label: "production" },
      ]
    : [{ url: process.env.BASE_URL || LOCAL_URL, label: process.env.BASE_URL?.includes("vercel") ? "production" : "local" }];

  console.log("═".repeat(64));
  console.log("  ATSLift API — Full Stress Test (upper-limit discovery)");
  console.log("═".repeat(64));
  console.log(`Targets: ${targets.map((t) => t.url).join(", ")}`);
  console.log(`Ramp steps: ${RAMP_STEPS.join(" → ")}`);
  console.log(`Stop ramp when error rate > ${ERROR_RATE_STOP * 100}%\n`);

  const results = {};
  for (const { url, label } of targets) {
    results[label] = await runFullSuite(url, label);
  }

  if (RUN_BOTH) {
    printComparison(results.local, results.production);
  }

  console.log("\n" + "═".repeat(64));
  console.log("  NOTES");
  console.log("═".repeat(64));
  console.log(`
  • Per-user cap: 5 resumes/min/IP (hard limit in API)
  • Production uses live LLM (Gemini/Groq) — slower & API-quota bound
  • Production test creates real DB records — use sparingly
  • Vercel serverless: cold starts add 1–3s; maxDuration=60s per function
  • Re-run: node scratch/stress-test.mjs --both
  • Tune: SUSTAIN_SEC=120 MAX_CONCURRENCY=80 MAX_TOTAL_REQUESTS=1000 node scratch/stress-test.mjs --both
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
