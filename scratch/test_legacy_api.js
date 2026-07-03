const pdf = require("pdf-parse");
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
    console.log("Calling pdf(buffer)...");
    const data = await pdf(buffer);
    console.log("Parsed text:", data.text);
  } catch (error) {


  }
}

main();
