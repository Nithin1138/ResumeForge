const PDFParser = require("pdf2json");
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
    const text = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.parseBuffer(buffer);
    });
    console.log("pdf2json successfully parsed! Text:");
    console.log(text);
  } catch (error) {
    console.error("pdf2json failed:", error);
  }
}

main();
