const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateResume() {
  const doc = new PDFDocument({ margin: 50 });
  const writeStream = fs.createWriteStream("public/test_resume.pdf");
  doc.pipe(writeStream);

  // Name
  doc.fontSize(22).text("Nithin Kumar", { align: "center" });
  doc.moveDown(0.5);

  // Contact Info
  doc.fontSize(10).text("Email: nithin.kumar@vit.edu | Phone: +91 9876543210 | GitHub: github.com/nithin | LinkedIn: linkedin.com/in/nithin", { align: "center" });
  doc.moveDown(1.5);

  // Education Section
  doc.fontSize(14).text("Education", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).text("VIT-AP University", { bold: true });
  doc.fontSize(10).text("B.Tech in Computer Science and Engineering | CGPA: 8.76 / 10 | Graduation: 2025");
  doc.moveDown(1.5);

  // Experience
  doc.fontSize(14).text("Experience", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).text("Software Engineering Intern | TechCorp (May 2024 - July 2024)");
  doc.fontSize(10).text("Developed backend APIs with Node.js and React frontend components. Optimized database queries which reduced latency by 15%. Tools used: Javascript, React, SQL, Express.");
  doc.moveDown(1.5);

  // Projects
  doc.fontSize(14).text("Projects", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(11).text("AI Resume Builder | Tech Stack: React, Next.js, Node.js");
  doc.fontSize(10).text("Built an AI-powered resume builder website. Implemented parsing using Gemini. Project link: https://github.com/nithin/resume-builder");
  doc.moveDown(1.5);

  // Achievements
  doc.fontSize(14).text("Achievements", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(10).text("- Secured 2nd Rank in Smart India Hackathon 2023 for building a blockchain prototype.");
  doc.fontSize(10).text("- Completed 300+ problems on LeetCode (LeetCode Profile: https://leetcode.com/nithin1138).");

  doc.end();
  
  return new Promise((resolve, reject) => {
    writeStream.on("finish", () => {
      console.log("PDF Resume generated successfully at public/test_resume.pdf");
      resolve();
    });
    writeStream.on("error", (err) => {
      reject(err);
    });
  });
}

generateResume();
