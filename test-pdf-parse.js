const fs = require('fs');
const PDFParser = require("pdf2json");

// Create a valid, simple dummy PDF using a quick hack or we can just download one.
// Let's just download a simple pdf.
const https = require('https');
https.get('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', (res) => {
  const data = [];
  res.on('data', (chunk) => data.push(chunk));
  res.on('end', () => {
    const buffer = Buffer.concat(data);
    
    const pdfParser = new PDFParser(null, 1);
    pdfParser.on("pdfParser_dataError", errData => console.error("Error:", errData.parserError) );
    pdfParser.on("pdfParser_dataReady", pdfData => {
        console.log("Success!");
        console.log("Text:", decodeURIComponent(pdfParser.getRawTextContent()));
    });
    pdfParser.parseBuffer(buffer);
  });
});
