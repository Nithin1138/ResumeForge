const fs = require("fs");
const path = require("path");

async function main() {
  try {
    const pdfPath = path.resolve(process.cwd(), "public/test_resume.pdf");
    if (!fs.existsSync(pdfPath)) {
      console.error("Test resume PDF does not exist at:", pdfPath);
      return;
    }
    const buffer = fs.readFileSync(pdfPath);
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "application/pdf" });
    formData.append("file", blob, "test_resume.pdf");

    console.log("Sending POST request with public/test_resume.pdf to http://127.0.0.1:3000/api/parse-resume...");
    const response = await fetch("http://127.0.0.1:3000/api/parse-resume", {
      method: "POST",
      body: formData,
    });

    console.log("Response status:", response.status);
    const text = await response.text();
    console.log("Response body:");
    try {
      const json = JSON.parse(text);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(text);
    }
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

main();
