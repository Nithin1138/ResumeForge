const PDFDocument = require("pdfkit");

function createPdfBuffer() {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.text("Hello world!", 100, 100);
    doc.end();
  });
}

async function main() {
  try {
    const buffer = await createPdfBuffer();
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "application/pdf" });
    formData.append("file", blob, "resume.pdf");

    console.log("Sending POST request to http://127.0.0.1:3000/api/parse-resume...");
    const response = await fetch("http://127.0.0.1:3000/api/parse-resume", {
      method: "POST",
      body: formData,
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));
    const text = await response.text();
    console.log("Response body preview (first 1000 chars):");
    console.log(text.substring(0, 1000));
  } catch (error) {
    console.error("Fetch error:", error);
  }
}

main();
