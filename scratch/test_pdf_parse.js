const { PDFParse } = require("pdf-parse");

async function main() {
  try {
    const parser = new PDFParse({ data: new Uint8Array([0, 1, 2, 3]) });
    console.log("Calling getText()...");
    const result = await parser.getText();
    console.log("Result:", result);
  } catch (error) {
    console.error("Error in main:", error);
  }
}

main();
