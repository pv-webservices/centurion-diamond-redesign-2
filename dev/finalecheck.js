/* Regression check for the supplied-film retail scrub. */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const sizes = [[1440,900],[1366,768],[1024,768],[430,932],[390,844],[375,812],[844,390]];

(async () => {
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  const shotDir = path.join(__dirname, 'shots');
  fs.mkdirSync(shotDir, { recursive:true });
  let failures = 0;

  for (const [width,height] of sizes) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.setViewport({ width, height, isMobile:width < 900, hasTouch:width < 900 });
    await page.goto('http://localhost:4321', { waitUntil:'networkidle2', timeout:60000 });
    await wait(2200);

    const before = await page.evaluate(() => performance.getEntriesByType('resource').filter(r => r.name.includes('/retail-scrub/')).length);
    const geometry = await page.evaluate(() => {
      const fin = document.getElementById('retail-showcase');
      const exc = document.getElementById('exclusive');
      const contact = document.getElementById('contact');
      return {
        top:fin.offsetTop,
        height:fin.offsetHeight,
        order:fin.offsetTop < exc.offsetTop && exc.offsetTop < contact.offsetTop
      };
    });

    async function scrollTo(progress) {
      await page.evaluate(({y}) => {
        if (window.lenis) window.lenis.scrollTo(y, { immediate:true }); else window.scrollTo(0, y);
        if (window.ScrollTrigger) ScrollTrigger.update();
      }, { y:geometry.top + (geometry.height - height) * progress });
      await wait(180);
    }

    const forward = [];
    for (const progress of [0,.10,.40,.72,.84,.96,1]) {
      await scrollTo(progress);
      await page.waitForFunction(() => document.querySelector('[data-fin-canvas]').classList.contains('is-ready'), { timeout:8000 });
      await wait(220);
      forward.push(await page.$eval('[data-fin-canvas]', canvas => +canvas.dataset.frame));
    }
    const reverse = [];
    for (const progress of [.84,.40,.10,0]) {
      await scrollTo(progress);
      await wait(320);
      reverse.push(await page.$eval('[data-fin-canvas]', canvas => +canvas.dataset.frame));
    }

    await scrollTo(.98);
    const result = await page.evaluate(() => {
      const canvas = document.querySelector('[data-fin-canvas]');
      const cta = document.querySelector('[data-fin-cta]');
      const rect = cta.getBoundingClientRect();
      const resources = performance.getEntriesByType('resource').map(r => r.name).filter(name => name.includes('/retail-scrub/'));
      return {
        overflow:document.documentElement.scrollWidth - document.documentElement.clientWidth,
        canvasReady:canvas.classList.contains('is-ready'),
        canvasPayload:canvas.toDataURL('image/webp',.3).length,
        ctaPointer:getComputedStyle(cta).pointerEvents,
        ctaVisible:rect.left >= 0 && rect.right <= innerWidth && rect.top >= 0 && rect.bottom <= innerHeight,
        href:cta.getAttribute('href'),
        mobileAssets:resources.some(name => name.includes('/mobile/')),
        desktopAssets:resources.some(name => !name.includes('/mobile/')),
        resources:resources.length
      };
    });

    const nonDecreasing = forward.every((value,index) => !index || value >= forward[index - 1]);
    const reverseDecreasing = reverse.every((value,index) => !index || value <= reverse[index - 1]);
    const correctSet = width < 900 ? result.mobileAssets && !result.desktopAssets : result.desktopAssets && !result.mobileAssets;
    const expectedLast = width < 900 ? 79 : 95;
    const ok = !errors.length && before === 0 && geometry.order && nonDecreasing && reverseDecreasing &&
      forward[0] === 0 && forward[forward.length - 1] === expectedLast && result.canvasReady &&
      result.canvasPayload > 10000 && result.overflow <= 1 && result.ctaPointer === 'auto' &&
      result.ctaVisible && result.href === '#contact' && correctSet;
    if (!ok) failures++;

    if (width === 1440 || width === 390) {
      await page.screenshot({ path:path.join(shotDir,`retail-${width}x${height}-final.png`) });
    }
    console.log(`${width}x${height} ${ok?'PASS':'FAIL'} before=${before} forward=${forward.join('>')} reverse=${reverse.join('>')} assets=${result.resources} set=${correctSet?'correct':'WRONG'} cta=${result.ctaPointer}/${result.ctaVisible} overflow=${result.overflow} errors=${errors.length}`);
    if (errors.length) console.log(errors);
    await page.close();
  }

  await browser.close();
  console.log(`TOTAL FAILURES: ${failures}`);
  process.exitCode = failures ? 1 : 0;
})().catch(error => { console.error(error); process.exit(1); });
