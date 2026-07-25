// scripts/stress-test.js
// Production Stress Testing & Performance Benchmark Runner for atslift.app

const BASE_URL = process.env.TEST_URL || "https://atslift.app";

const TARGET_ROUTES = [
  { name: "Homepage", path: "/" },
  { name: "Automations Dashboard", path: "/automations" },
  { name: "ATS Checker", path: "/ats-check" },
  { name: "Resume Builder", path: "/build" },
  { name: "My-Space Vault", path: "/my-space" },
  { name: "Login Page", path: "/login" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Terms of Service", path: "/terms" },
  { name: "Sitemap XML", path: "/sitemap.xml" },
  { name: "Robots TXT", path: "/robots.txt" },
];

const API_ROUTES = [
  { name: "Inbound Webhook API", path: "/api/resend/inbound", method: "POST" },
  { name: "Telegram Webhook API", path: "/api/telegram/webhook", method: "POST" },
];

async function measureRequest(url, options = {}) {
  const start = performance.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "User-Agent": "ATSLift-StressTester/1.0",
        ...(options.headers || {}),
      },
    });
    const duration = performance.now() - start;
    return { ok: res.ok, status: res.status, duration };
  } catch (err) {
    const duration = performance.now() - start;
    return { ok: false, status: 0, duration, error: err.message };
  }
}

async function runBenchmarkForRoute(route, concurrencyCount = 20) {
  const fullUrl = `${BASE_URL}${route.path}`;
  const promises = [];

  const postPayload = route.method === "POST" ? {
    type: "cloudflare.email",
    to: "jd_stress_test@atslift.app",
    from: "stress@university.edu",
    subject: "Benchmark Job Posting Email",
    text: "Company: Benchmark Corp\nRole: Stress Tester\nCTC: 20 LPA\nDeadline: 31/12/2026",
  } : null;

  for (let i = 0; i < concurrencyCount; i++) {
    const options = route.method === "POST" ? {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    } : { method: "GET" };

    promises.push(measureRequest(fullUrl, options));
  }

  const results = await Promise.all(promises);
  
  const durations = results.map(r => r.duration).sort((a, b) => a - b);
  const successCount = results.filter(r => r.ok || (route.method === "POST" && r.status === 200)).length;
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const minDuration = durations[0];
  const maxDuration = durations[durations.length - 1];
  const p95Duration = durations[Math.floor(durations.length * 0.95)] || maxDuration;

  return {
    name: route.name,
    path: route.path,
    concurrency: concurrencyCount,
    totalRequests: concurrencyCount,
    successfulRequests: successCount,
    failedRequests: concurrencyCount - successCount,
    successRate: ((successCount / concurrencyCount) * 100).toFixed(1),
    avgMs: Math.round(avgDuration),
    minMs: Math.round(minDuration),
    maxMs: Math.round(maxDuration),
    p95Ms: Math.round(p95Duration),
  };
}

async function runFullStressTest() {
  console.log(`\n==================================================`);
  console.log(`🚀 STRESS TEST & PERFORMANCE BENCHMARK`);
  console.log(`Target Host: ${BASE_URL}`);
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`==================================================\n`);

  const allMetrics = [];

  // Batch 1: Route Latency Benchmarks (20 Concurrent Requests each)
  console.log("▶ Phase 1: Testing Page Response Times (20 Concurrent Users)...");
  for (const route of TARGET_ROUTES) {
    const metrics = await runBenchmarkForRoute(route, 20);
    allMetrics.push(metrics);
    console.log(`  [${metrics.name}] Avg: ${metrics.avgMs}ms | P95: ${metrics.p95Ms}ms | Success: ${metrics.successRate}%`);
  }

  // Batch 2: API Route Latency Benchmarks
  console.log("\n▶ Phase 2: Testing API Webhook Endpoints (20 Concurrent Requests)...");
  for (const api of API_ROUTES) {
    const metrics = await runBenchmarkForRoute(api, 20);
    allMetrics.push(metrics);
    console.log(`  [${metrics.name}] Avg: ${metrics.avgMs}ms | P95: ${metrics.p95Ms}ms | Success: ${metrics.successRate}%`);
  }

  // Batch 3: High Concurrency Spike Test on Core Landing & Automations (50 Concurrent Requests)
  console.log("\n▶ Phase 3: High Concurrency Spike Test (50 Concurrent Requests)...");
  const spikeMetrics1 = await runBenchmarkForRoute({ name: "Homepage (Spike 50)", path: "/" }, 50);
  const spikeMetrics2 = await runBenchmarkForRoute({ name: "Automations (Spike 50)", path: "/automations" }, 50);
  const spikeMetrics3 = await runBenchmarkForRoute({ name: "Inbound API (Spike 50)", path: "/api/resend/inbound", method: "POST" }, 50);
  allMetrics.push(spikeMetrics1, spikeMetrics2, spikeMetrics3);

  console.log(`  [Homepage Spike 50] Avg: ${spikeMetrics1.avgMs}ms | P95: ${spikeMetrics1.p95Ms}ms | Success: ${spikeMetrics1.successRate}%`);
  console.log(`  [Automations Spike 50] Avg: ${spikeMetrics2.avgMs}ms | P95: ${spikeMetrics2.p95Ms}ms | Success: ${spikeMetrics2.successRate}%`);
  console.log(`  [Inbound API Spike 50] Avg: ${spikeMetrics3.avgMs}ms | P95: ${spikeMetrics3.p95Ms}ms | Success: ${spikeMetrics3.successRate}%`);

  console.log("\n==================================================");
  console.log("📊 STRESS TEST COMPLETED SUCCESSFULLY!");
  console.log("==================================================\n");

  // Output JSON formatted metrics for report generator
  console.log("JSON_METRICS_START");
  console.log(JSON.stringify(allMetrics, null, 2));
  console.log("JSON_METRICS_END");
}

runFullStressTest();
