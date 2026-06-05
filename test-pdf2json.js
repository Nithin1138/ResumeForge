const fs = require('fs');
const PDFParser = require('pdf2json');

let pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync('./pdf-dump.json', JSON.stringify(pdfData));
    console.log("Dumped JSON to pdf-dump.json");
});

pdfParser.loadPDF('./test-link.pdf');
