const PDFParser = require("pdf2json");
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
    
    console.log("Parsing test PDF with pdf2json...");
    const text = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser(null, 1);
      pdfParser.on("pdfParser_dataError", (err) => reject(err.parserError));
      pdfParser.on("pdfParser_dataReady", () => {
        resolve(pdfParser.getRawTextContent());
      });
      pdfParser.parseBuffer(buffer);
    });
    
    console.log("pdf2json successfully parsed!");
    console.log("Text length:", text.length);
    console.log("Text preview (first 300 chars):");
    console.log(text.substring(0, 300));
  } catch (error) {
    console.error("pdf2json failed on real PDF:", error);
  }
}

main();
