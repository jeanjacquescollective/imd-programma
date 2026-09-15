const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  const errs = [];
  page.on('console', msg => { if (msg.type() === 'error') errs.push(msg.text()); });
  page.on('pageerror', err => errs.push('PAGEERROR: ' + err.message));
  const outDir = 'C:/Users/janne/AppData/Local/Temp/claude/c--Users-janne-Documents-dev-imd-programma/eef82a45-ea48-4c71-a222-024e5981e8f3/scratchpad';

  await page.goto('http://localhost:3000/trajects/' + encodeURIComponent('Contacttraject Cross Media Design'), { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${outDir}/cmd-current.png`, fullPage: true });
  console.log('ERRORS', JSON.stringify(errs));
  await browser.close();
})();
