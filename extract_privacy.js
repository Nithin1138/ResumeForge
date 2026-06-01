const fs = require("fs");
const content = fs.readFileSync("/Users/nithin/.gemini/antigravity/brain/c6e4f4c0-847a-4897-a8fa-66e6dbf5f37c/.system_generated/steps/176/content.md", "utf-8");
const match = content.match(/\\u003c!DOCTYPE html\\u003e[\\s\\S]*?\\u003c\\/html\\u003e/);
if (match) {
  const htmlStr = match[0].replace(/\\u003c/g, "<").replace(/\\u003e/g, ">").replace(/\\u0026/g, "&").replace(/\\"/g, '"');
  
  const reactCode = `
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ATSLift",
  description: "Learn how ATSLift protects your resume data.",
};

export default function PrivacyPolicy() {
  return (
    <div dangerouslySetInnerHTML={{ __html: \`${htmlStr.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\` }} />
  );
}
`;
  fs.mkdirSync("/Users/nithin/Projects/resume/app/privacy", { recursive: true });
  fs.writeFileSync("/Users/nithin/Projects/resume/app/privacy/page.tsx", reactCode);
  console.log("Successfully created /privacy/page.tsx");
} else {
  console.log("Failed to extract HTML");
}
