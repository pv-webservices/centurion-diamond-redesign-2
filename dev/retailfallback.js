/* Reduced-motion and no-JS verification for the retail showcase. */
const puppeteer = require('puppeteer');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  let failures = 0;
  for (const mode of ['reduced','no-js']) {
    for (const [width,height] of [[1440,900],[390,844]]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height, isMobile:width < 900, hasTouch:width < 900 });
      if (mode === 'reduced') await page.emulateMediaFeatures([{ name:'prefers-reduced-motion', value:'reduce' }]);
      else await page.setJavaScriptEnabled(false);
      await page.goto('http://localhost:4321', { waitUntil:'networkidle2', timeout:60000 });
      await page.evaluate(() => document.getElementById('retail-showcase').scrollIntoView());
      await wait(1600);
      const result = await page.evaluate(() => {
        const root = document.getElementById('retail-showcase');
        const poster = root.querySelector('.fin__poster');
        const canvas = root.querySelector('.fin__canvas');
        const title = root.querySelector('.fin__title');
        const cta = root.querySelector('.fin__cta');
        const copy = root.querySelector('.fin__copy-in');
        const copyRect = copy.getBoundingClientRect();
        const display = document.getElementById('display');
        const exclusive = document.getElementById('exclusive');
        const contact = document.getElementById('contact');
        return {
          height:root.offsetHeight,
          poster:poster.complete && poster.naturalWidth === 1280 && getComputedStyle(poster).display !== 'none',
          canvasHidden:getComputedStyle(canvas).display === 'none',
          titleVisible:title.getBoundingClientRect().height > 0,
          ctaVisible:cta.getBoundingClientRect().height > 0 && getComputedStyle(cta).pointerEvents === 'auto',
          centered:Math.abs(copyRect.left + copyRect.width / 2 - document.documentElement.clientWidth / 2) <= 2 && getComputedStyle(copy).textAlign === 'center',
          order:display.offsetTop < exclusive.offsetTop && exclusive.offsetTop < root.offsetTop && root.offsetTop < contact.offsetTop,
          reducedClass:root.classList.contains('is-reduced'),
          overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      });
      const ok = result.poster && result.canvasHidden && result.titleVisible && result.ctaVisible && result.centered && result.order && result.overflow <= 1 &&
        (mode === 'no-js' || result.reducedClass);
      if (!ok) failures++;
      console.log(`${mode} ${width}x${height} ${ok?'PASS':'FAIL'} poster=${result.poster} canvasHidden=${result.canvasHidden} title=${result.titleVisible} cta=${result.ctaVisible} centered=${result.centered} order=${result.order} overflow=${result.overflow}`);
      await page.close();
    }
  }
  await browser.close();
  console.log(`TOTAL FAILURES: ${failures}`);
  process.exitCode = failures ? 1 : 0;
})().catch(error => { console.error(error); process.exit(1); });
