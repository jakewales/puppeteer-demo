const puppeteer = require('puppeteer');
const mkdirp = require('mkdirp');

(async () => {
  const savePath = './aotu-book';
  try {
    mkdirp.sync(savePath);
  } catch (e) {
    console.log(JSON.stringify(e));
  }
  
  // 初始化puppeteer的浏览器
  const browser = await puppeteer.launch({
    headless: true,
    timeout: 0
  });
  // 打开主页
  const page = await browser.newPage();
  page.setViewport({
    width: 1280,
    height: 720
  });
  page.setJavaScriptEnabled(true);
  await page.goto('https://aotu.io/index.html');
  await page.waitForSelector('.cate-menu-item.active');

  // 滚动页面到底部，获取完整数据
  let scroll = {
    oldScrollTop: 0,
    newScrollTop: 720,
    scrollStep: 500
  };
  while (scroll.oldScrollTop !== scroll.newScrollTop) {
    scroll = await page.evaluate((scroll) => {
      scroll.oldScrollTop = document.scrollingElement.scrollTop;
      document.scrollingElement.scrollTop = scroll.oldScrollTop + scroll.scrollStep;
      scroll.newScrollTop = document.scrollingElement.scrollTop;
      return scroll;
    }, scroll);
    await page.waitFor(1000);
    console.log(JSON.stringify(scroll));
  }

  // 获取所有文章链接

  let urlList = await page.$eval('#posts', element => {
    const urlElement = element.querySelectorAll('article > a');
    const urlElementArray = Array.prototype.slice.call(urlElement);
    return urlElementArray.map((item) => {
      return item.href;
    });
  });
  
  // 访问链接

  for (let url of urlList) {
    try {
      const contentPage = await browser.newPage();
      contentPage.setViewport({
        width: 1280,
        height: 720
      });
      await contentPage.goto(url);
      await contentPage.waitForSelector('header > h1.post-tit');
      let title = await contentPage.$eval('body', body => {
        body.querySelector('#sidebar').style.display = 'none';
        body.querySelector('.page-post-detail div:first-child').style.display = 'none';
        body.querySelector('footer#footer').style.display = 'none';
        return body.querySelector('header > h1.post-tit').innerText;
      });
      await contentPage.pdf({
        path: `${savePath}/${title}.pdf`,
        format: 'A4'
      });
      console.log(`完成${title}`);
      await contentPage.close();
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }


  await browser.close();
})();




