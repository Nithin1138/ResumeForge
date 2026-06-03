const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
    page.on('requestfailed', request => console.error('REQUEST FAILED:', request.url(), request.failure().errorText));

    console.log("Navigating to home...");
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    console.log("Home page loaded.");
    
    console.log("Navigating to a result page...");
    // Just a dummy ID to see if it crashes on render
    await page.goto('http://localhost:3000/result/clwp8y5i3000008lc6t4v3s9d', { waitUntil: 'networkidle2' });
    console.log("Result page loaded.");

    console.log("Navigating to a success page...");
    await page.goto('http://localhost:3000/success/clwp8y5i3000008lc6t4v3s9d', { waitUntil: 'networkidle2' });
    console.log("Success page loaded.");

    await browser.close();
  } catch (err) {
    console.error("SCRIPT ERROR:", err);
  }
})();
