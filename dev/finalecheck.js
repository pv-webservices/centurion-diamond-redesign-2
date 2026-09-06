/* Regression check for the supplied-film retail scrub. */
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const sizes = (process.env.SIZES || '1440x900,1366x768,1280x720,1024x768,430x932,390x844,375x812,360x800,844x390')
  .split(',').map(size => size.split('x').map(Number));

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
      const display = document.getElementById('display');
      const fin = document.getElementById('retail-showcase');
      const exc = document.getElementById('exclusive');
      const contact = document.getElementById('contact');
      const finCopy = fin.querySelector('.fin__copy-in');
      const contactInner = contact.querySelector('.contact__inner');
      const finRect = finCopy.getBoundingClientRect();
      const finStageRect = fin.querySelector('.fin__stage').getBoundingClientRect();
      const contactRect = contactInner.getBoundingClientRect();
      const contactSectionRect = contact.getBoundingClientRect();
      const anchorTargetsForward = [...document.querySelectorAll('a[href="#contact"]')]
        .every(anchor => anchor.getBoundingClientRect().top + scrollY < contact.offsetTop);
      return {
        top:fin.offsetTop,
        height:fin.offsetHeight,
        order:display.offsetTop < exc.offsetTop && exc.offsetTop < fin.offsetTop && fin.offsetTop < contact.offsetTop,
        numbers:[
          display.querySelector('.dsp__eyebrow b')?.textContent.trim(),
          exc.querySelector('.exc__eyebrow b')?.textContent.trim(),
          fin.querySelector('.fin__eyebrow b')?.textContent.trim(),
          contact.querySelector('.label b')?.textContent.trim()
        ].join(','),
        finDelta:finRect.left + finRect.width / 2 - (finStageRect.left + finStageRect.width / 2),
        finCentered:Math.abs(finRect.left + finRect.width / 2 - (finStageRect.left + finStageRect.width / 2)) <= 2 && getComputedStyle(finCopy).textAlign === 'center',
        contactCentered:Math.abs(contactRect.left + contactRect.width / 2 - (contactSectionRect.left + contactSectionRect.width / 2)) <= 2 && getComputedStyle(contactInner).textAlign === 'center',
        anchorTargetsForward
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
        ctaHeight:rect.height,
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
    const ok = !errors.length && before === 0 && geometry.order && geometry.numbers === '06,07,08,09' &&
      geometry.finCentered && geometry.contactCentered && geometry.anchorTargetsForward && nonDecreasing && reverseDecreasing &&
      forward[0] === 0 && forward[forward.length - 1] === expectedLast && result.canvasReady &&
      result.canvasPayload > 5000 && result.overflow <= 1 && result.ctaPointer === 'auto' &&
      result.ctaVisible && result.ctaHeight >= 44 && result.href === '#contact' && correctSet;
    if (!ok) failures++;

    if (width === 1440 || width === 390) {
      await page.screenshot({ path:path.join(shotDir,`retail-${width}x${height}-final.png`) });
      await page.evaluate(viewportHeight => {
        const contact = document.getElementById('contact');
        const y = contact.offsetTop - Math.max(0, (viewportHeight - contact.offsetHeight) / 2);
        if (window.lenis) window.lenis.scrollTo(y, { immediate:true }); else window.scrollTo(0, y);
        if (window.ScrollTrigger) ScrollTrigger.update();
      }, height);
      await wait(220);
      await page.screenshot({ path:path.join(shotDir,`contact-${width}x${height}.png`) });
    }
    console.log(`${width}x${height} ${ok?'PASS':'FAIL'} order=${geometry.order}/${geometry.numbers} centered=${geometry.finCentered}/${geometry.contactCentered} delta=${geometry.finDelta.toFixed(2)} anchors=${geometry.anchorTargetsForward} before=${before} forward=${forward.join('>')} reverse=${reverse.join('>')} assets=${result.resources} set=${correctSet?'correct':'WRONG'} canvas=${result.canvasReady}/${result.canvasPayload} cta=${result.ctaPointer}/${result.ctaVisible}/${Math.round(result.ctaHeight)} overflow=${result.overflow} errors=${errors.length}`);
    if (errors.length) console.log(errors);
    await page.close();
  }

  await browser.close();
  console.log(`TOTAL FAILURES: ${failures}`);
  process.exitCode = failures ? 1 : 0;
})().catch(error => { console.error(error); process.exit(1); });
