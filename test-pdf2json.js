const PDFParser = require("pdf2json");

let pdfParser = new PDFParser(null, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    console.log("Success with null");
});

console.log("Syntax is fine!");
