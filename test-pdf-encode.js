const fs = require('fs');
const PDFParser = require("pdf2json");

let pdfParser = new PDFParser(null, 1);
pdfParser.on("pdfParser_dataReady", pdfData => {
    let rawText = pdfParser.getRawTextContent();
    console.log("RAW PDF2JSON OUTPUT:");
    console.log(rawText.substring(0, 500)); // Print snippet to see what's going on
});

// We need a PDF with % in it.
