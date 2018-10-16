const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');

const url = process.argv[2];
const savePath = process.argv[3];

(async () => {
  try {
    mkdirp.sync(savePath);
  } catch (e) {
    console.log(JSON.stringify(e));
  }

  const browser = await puppeteer.launch({
    headless: true,
  });

  const page = await  browser.newPage({
    timeout: 0
  });
  page.setViewport({
    width: 1280,
    height: 720
  });

  try {
    await page.goto(url);
    await page.waitFor(2000);
    let title = await page.$eval('html', html => {
      return html.querySelector('title').innerText;
    });

    let pageHeight = await page.$eval('html',html => {
      return document.documentElement.offsetHeight;
    });

    let scroll = 0;
    while (scroll < pageHeight) {
      scroll = await page.evaluate(scroll => {
        document.querySelector('header').style.display = 'none';
        scroll += 50;
        document.scrollingElement.scrollTop = scroll;
        return scroll;
      }, scroll);
      await page.waitFor(200);
      console.log(scroll);
    }

    // let scroll = {
    //   oldScrollTop: 0,
    //   newScrollTop: 720,
    //   scrollStep: 500
    // };

    // while (scroll.oldScrollTop !== scroll.newScrollTop && scroll.newScrollTop < 10000) {
    //   scroll = await page.evaluate((scroll) => {
    //     scroll.oldScrollTop = document.scrollingElement.scrollTop;
    //     document.scrollingElement.scrollTop = scroll.oldScrollTop + scroll.scrollStep;
    //     scroll.newScrollTop = document.scrollingElement.scrollTop;
    //     return scroll;
    //   }, scroll);
    //   await page.waitFor(200);
    //   console.log(JSON.stringify(scroll));
    // }
    await page.pdf({
      path: `${savePath}/${title}.pdf`,
      format: 'A4'
    });
    console.log('save success');
    await page.close();
  } catch(e) {
    console.log(JSON.stringify(e));
  }
  await browser.close();
})();