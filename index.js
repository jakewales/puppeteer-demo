const puppeteer = require('puppeteer');

(async () => {
  let capterLinks = [];
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 0
  });
  const page = await browser.newPage();
  page.setViewport({
    width: 1920,
    height: 1080
  });
  await page.goto('https://www.jd.com/');
  await page.waitFor(2000);
  await page.focus('#key');
  await page.type('相机');
  await page.waitFor(2000);
  await page.screenshot({
    path: 'jd.jpg'
  })
  await browser.close();
})();