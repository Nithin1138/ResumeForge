const pdf = require("pdf-parse");
const PDFDocument = require("pdfkit");

function createPdfBuffer() {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.text("Hello world from original pdf-parse!", 100, 100);
    doc.end();
  });
}

async function main() {
  try {
    const buffer = await createPdfBuffer();
    console.log("Parsing with pdf-parse v1.1.1...");
    const data = await pdf(buffer);
    console.log("Successfully parsed!");
    console.log("Text:", data.text.trim());
  } catch (error) {
    console.error("Error parsing:", error);
  }
}

main();
