// tests/unit/atsScoring.test.ts
import { test, describe } from "node:test";
import assert from "node:assert";
import { generateHeuristicAtsFallback, DAILY_ATS_CHECK_LIMIT } from "../../lib/ats-scoring";

describe("ATS Scoring Logic & Heuristic Fallbacks", () => {
  test("DAILY_ATS_CHECK_LIMIT is enforced at 10 checks per day", () => {
    assert.strictEqual(DAILY_ATS_CHECK_LIMIT, 10);
  });

  test("generateHeuristicAtsFallback calculates baseline score for minimal profile", () => {
    const minimalProfile = {
      fullName: "Junior Student",
      skillsJson: "[]",
      projectsJson: "[]",
    };

    const output = generateHeuristicAtsFallback(minimalProfile);

    assert.ok(typeof output.overall_score === "number");
    assert.ok(output.overall_score >= 35 && output.overall_score <= 60);
    assert.ok(output.structural_issues.length > 0);
    assert.ok(output.structural_issues.some((s) => s.includes("GitHub")));
  });

  test("generateHeuristicAtsFallback awards points for skills, projects, links and metrics", () => {
    const richProfile = {
      fullName: "Senior Dev",
      github: "https://github.com/developer",
      linkedin: "https://linkedin.com/in/developer",
      cgpa: "9.2",
      skillsJson: JSON.stringify(["TypeScript", "Python", "React", "Node.js", "Docker", "PostgreSQL", "Redis", "AWS"]),
      projectsJson: JSON.stringify([
        {
          title: "High Throughput Queue",
          description: "Optimized worker pipeline reducing p95 latency by 45% for 10,000 concurrent users.",
        },
        {
          title: "Microservice Platform",
          description: "Built REST microservices serving 500 req/sec with Docker and PostgreSQL.",
        },
      ]),
    };

    const output = generateHeuristicAtsFallback(richProfile);

    assert.ok(output.overall_score >= 80, `Expected score >= 80, got ${output.overall_score}`);
    assert.ok(output.strengths.length >= 3);
    assert.strictEqual(output.structural_issues.length, 0);
  });

  test("generateHeuristicAtsFallback identifies missing JD keywords accurately", () => {
    const profile = {
      fullName: "Full-Stack Dev",
      skillsJson: JSON.stringify(["JavaScript", "HTML", "CSS", "Node.js"]),
      projectsJson: "[]",
    };

    const targetJob = {
      roleTitle: "Cloud Backend Engineer",
      eligibilityCriteria: "Required: Docker, Kubernetes, AWS, and TypeScript expertise.",
      rawEmailText: "We need someone with strong Docker containerization and Kubernetes orchestration.",
    };

    const output = generateHeuristicAtsFallback(profile, targetJob);

    assert.ok(output.keyword_gaps.includes("DOCKER"), "Docker should be flagged as missing keyword");
    assert.ok(output.keyword_gaps.includes("TYPESCRIPT") || output.keyword_gaps.includes("AWS"));
    assert.ok(output.improvements.some((i) => i.suggestion.includes("matching the job description")));
  });

  test("generateHeuristicAtsFallback clamps overall score within bounds [35, 95]", () => {
    const emptyProfile = {};
    const lowOutput = generateHeuristicAtsFallback(emptyProfile);
    assert.ok(lowOutput.overall_score >= 35);

    const superProfile = {
      github: "https://github.com/pro",
      linkedin: "https://linkedin.com/in/pro",
      cgpa: "10.0",
      skillsJson: JSON.stringify(Array(20).fill("Skill")),
      projectsJson: JSON.stringify(Array(10).fill({ description: "reduced latency by 90% for 1M users" })),
    };
    const highOutput = generateHeuristicAtsFallback(superProfile);
    assert.ok(highOutput.overall_score <= 95);
  });
});
