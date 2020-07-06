const puppeteer = require('puppeteer');

const argv = process.argv.slice(2);
const url = argv[0] || 'https://primevox.net';
const hostname = (new URL(url))
  .hostname;

(async () => {
  console.log('Launching...');
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url);
  await page.screenshot({ path: './screenshots/' + hostname + '.png' });
  await browser.close();
  console.log('\nDone!');
})();
