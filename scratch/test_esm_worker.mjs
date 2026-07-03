import { PDFParse } from "pdf-parse";
import fs from "fs";
import path from "path";

async function main() {
  try {
    const workerPath = path.resolve(process.cwd(), "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
    console.log("Reading worker file from:", workerPath);
    const workerCode = fs.readFileSync(workerPath, "utf8");
    console.log("Worker size:", workerCode.length, "chars");

    const workerUrl = `data:text/javascript;base64,${Buffer.from(workerCode).toString("base64")}`;
    console.log("Worker Data URL created, length:", workerUrl.length);

    PDFParse.setWorker(workerUrl);
    console.log("Worker set successfully.");

    const pdfPath = path.resolve(process.cwd(), "public/test_resume.pdf");
    if (fs.existsSync(pdfPath)) {
      const buffer = fs.readFileSync(pdfPath);
      console.log("Parsing test PDF...");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const textResult = await parser.getText();
      console.log("Parsing succeeded! Text length:", textResult.text.length);
    }
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
