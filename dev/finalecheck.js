/* Regression check for the five-cut morph and nine-product retail finale. */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const T = ms => new Promise(resolve => setTimeout(resolve, ms));
const sizes = [[1440,900],[1366,768],[1024,768],[430,932],[390,844],[375,812],[844,390]];

(async () => {
  const browser = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--autoplay-policy=no-user-gesture-required'] });
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
    await T(2800);

    const geometry = await page.evaluate(() => {
      const read = id => { const el=document.getElementById(id); return { top:el.offsetTop, h:el.offsetHeight }; };
      return { anatomy:read('anatomy'), finale:read('contact') };
    });
    const scrollToProgress = async (section, p) => {
      const g = geometry[section];
      await page.evaluate(y => {
        if (window.lenis) window.lenis.scrollTo(y,{immediate:true}); else window.scrollTo(0,y);
        if (window.ScrollTrigger) ScrollTrigger.update();
      }, g.top + (g.h - height) * p);
      await T(180);
    };

    const labels = [];
    const morphProgress = [.205,.35125,.4975,.64375,.79];
    for (const p of morphProgress) {
      await scrollToProgress('anatomy', p);
      labels.push(await page.$eval('[data-plr-shape-label]', el => el.textContent.trim()));
      if (p === morphProgress[2] && (width === 1440 || width === 390)) {
        await page.screenshot({ path:path.join(shotDir,`morph-${width}x${height}-radiant.png`) });
      }
    }
    const reverse = [];
    for (const p of morphProgress.slice().reverse()) {
      await scrollToProgress('anatomy', p);
      reverse.push(await page.$eval('[data-plr-shape-label]', el => el.textContent.trim()));
    }

    await scrollToProgress('finale', .46);
    await page.waitForFunction(() => [...document.querySelectorAll('.fin__ring img')].every(img => img.complete && img.naturalWidth > 0), { timeout:5000 }).catch(() => {});
    const mid = await page.evaluate(() => ({
      rings:document.querySelectorAll('.fin__ring').length,
      loaded:[...document.querySelectorAll('.fin__ring img')].filter(img => img.complete && img.naturalWidth > 0).length,
      visible:[...document.querySelectorAll('.fin__ring')].filter(el => +getComputedStyle(el).opacity > .03).length,
      caseOpacity:+getComputedStyle(document.querySelector('.fin__case')).opacity
    }));
    if (width === 1440 || width === 390) await page.screenshot({ path:path.join(shotDir,`finale-${width}x${height}-rings.png`) });

    await scrollToProgress('finale', .98);
    const end = await page.evaluate(() => {
      const cta=document.querySelector('[data-fin-cta]'), r=cta.getBoundingClientRect(), de=document.documentElement;
      return {
        overflow:de.scrollWidth-de.clientWidth,
        caseOpacity:+getComputedStyle(document.querySelector('.fin__case')).opacity,
        copyOpacity:+getComputedStyle(document.querySelector('.fin__copy')).opacity,
        ctaPointer:getComputedStyle(cta).pointerEvents,
        ctaInFrame:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,
        href:cta.href
      };
    });
    if (width === 1440 || width === 390) await page.screenshot({ path:path.join(shotDir,`finale-${width}x${height}-cta.png`) });

    const expected = ['Round','Oval','Radiant','Emerald','Cushion'];
    const ok = !errors.length && JSON.stringify(labels) === JSON.stringify(expected) &&
      JSON.stringify(reverse) === JSON.stringify(expected.slice().reverse()) &&
      mid.rings === 9 && mid.loaded === 9 && end.overflow <= 1 && end.copyOpacity > .95 &&
      end.ctaPointer === 'auto' && end.ctaInFrame;
    if (!ok) failures++;
    console.log(`${width}x${height} ${ok?'PASS':'FAIL'} labels=${labels.join('>')} reverse=${reverse.join('>')} rings=${mid.rings}/${mid.loaded} visible@.46=${mid.visible} case=${mid.caseOpacity.toFixed(2)} endCopy=${end.copyOpacity.toFixed(2)} cta=${end.ctaPointer}/${end.ctaInFrame} overflow=${end.overflow} errors=${errors.length}`);
    if (errors.length) console.log('  '+errors.slice(0,3).join(' | '));
    await page.close();
  }

  console.log(`TOTAL FAILURES: ${failures}`);
  await browser.close();
  process.exitCode = failures ? 1 : 0;
})();
