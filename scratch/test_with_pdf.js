const { PDFParse } = require("pdf-parse");
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
    console.log("Generating test PDF...");
    const buffer = await createPdfBuffer();
    console.log("PDF generated, size:", buffer.length);
    
    console.log("Setting PDF worker...");
    const path = require("path");
    const workerPath = path.resolve(process.cwd(), "node_modules/pdfjs-dist/build/pdf.worker.mjs");
    PDFParse.setWorker(workerPath);

    console.log("Creating PDFParse instance...");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    
    console.log("Parsing text...");
    const textResult = await parser.getText();
    console.log("Successfully parsed! Text:", textResult.text);
  } catch (error) {
    console.error("Error encountered:", error);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

main();
