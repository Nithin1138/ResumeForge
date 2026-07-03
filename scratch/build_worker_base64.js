const fs = require("fs");
const path = require("path");

function main() {
  try {
    const workerPath = path.resolve(process.cwd(), "node_modules/pdf-parse/dist/pdf-parse/esm/pdf.worker.mjs");
    if (!fs.existsSync(workerPath)) {
      console.error("Worker file not found at:", workerPath);
      return;
    }
    const buffer = fs.readFileSync(workerPath);
    const base64 = buffer.toString("base64");
    
    const outputPath = path.resolve(process.cwd(), "lib/pdfWorkerBase64.ts");
    const outputContent = `// Automatically generated. Do not edit directly.\nexport const PDF_WORKER_BASE64 = "${base64}";\n`;
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, outputContent, "utf8");
    console.log("Successfully generated lib/pdfWorkerBase64.ts!");
    console.log("Base64 string length:", base64.length);
  } catch (error) {
    console.error("Failed to build base64 worker:", error);
  }
}

main();
