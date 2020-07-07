const puppeteer = require('puppeteer');
const { homedir } = require('os');
const { join, relative } = require('path');
const { ensureDirSync } = require('fs-extra');
const open = require('open');
const globby = require('globby');
const match = require('minimatch');
const rimraf = require('rimraf');

let argv = process.argv.slice(2);
const baseDir = join(homedir(), '.ssp');

const isHelp = argv.includes('-h') || argv.includes('--help');
const isAll = argv.includes('-a') || argv.includes('--all');

// Remove flags.
argv = argv.filter(v => !/^--?/.test(v));

let cmd = !isHelp && argv.shift();
let opt = argv.shift();
let opt2 = argv.shift();

if (cmd)
  cmd = cmd.toLowerCase();

// Ensure store directory.
ensureDirSync(baseDir);

if (isHelp) {
  const help = `
  Screenshot Puppet (utility for taking screenshots)

  Commands:
    take <url> [filename]   new screenshot at url.
    browse                  browse screenshot directory.
    list                    lists screenshots.
    view <filename>         views a screenshot.
    remove [pattern]        removes screenshots.

  Options:
    -a, --all     applys to all files.
    -h, --help    displays help.
  `;
  console.log(help);
  process.exit();
}


if (!cmd) {
  console.error(`Cannot run Screenshot Puppet using command of undefined.`);
  process.exit();
}

///////////////////////////////
// OPEN SCREENSHOTS DIRECTORY
///////////////////////////////

if (cmd === 'browse') {

  async function browseDir() {
    await open(baseDir, { wait: false });
    console.log(`Browsing at ${baseDir}.`);
  }

  browseDir();

}

/////////////////////
// LIST SCREENSHOTS
/////////////////////

else if (cmd === 'list') {

  const files = globby.sync(baseDir, { onlyFiles: true });

  if (!files || !files.length) {
    console.log('Command "list" returned 0 files.');
  }
  else {
    (files || [])
    .forEach((file, i) => {
      console.log(i + ') ' + relative(baseDir, file));
    });
  }

}

/////////////////////
// VIEW SCREENSHOT
/////////////////////

else if (cmd === 'view') {

  if (!opt) {
    console.error('Command "view" requires a filename but none was provided.');
    process.exit();
  }

  let files = globby.sync(baseDir, { onlyFiles: true });

  if (!files || !files.length) {
    console.warn(`Screenshot directory ${baseDir} is empty, cannot view ${opt}`);
    process.exit();
  }

  function find(input) {
    return files.filter(v => {
      const filename = relative(baseDir, v);
      return match(filename, input);
    });
  }

  async function viewImage() {

    const found = find(opt);

    if (!found.length) {
      console.warn(`No matches found for "${opt}"`)
      process.exit();
    }

    if (found.length > 1) {
      console.log('Are you looking for one of these?\n');
      found.forEach((file, i) => {
        console.log(i + ') ' + relative(baseDir, file));
      });
      process.exit();
    }

    else {
      try {
        await open(found[0], { wait: false });
        console.log(`Viewing ${relative(baseDir, found[0])}`);
      }
      catch (ex) {
        console.error(ex.message);
      }
    }

  }

  viewImage();

}

/////////////////////
// REMOVE SCREENSHOT
/////////////////////

else if (cmd === 'remove') {

  if (isAll) {
    rimraf(baseDir + '/*', (err) => {
      if (err)
        console.log(err.message);
      else
        console.log('All screenshots removed!');
    });
  }

  else {

    if (!opt) {
      console.error(`Cannot remove files without pattern of undefined.`);
    }
    
    else {

      opt = opt.replace(/^\//, '');
      let files = globby.sync(baseDir + '/' + opt, { onlyFiles: true });
      files = files.map(v => relative(baseDir, v));

      rimraf(baseDir + '/' + opt, (err) => {
        if (err)
          console.error(err.message);
        else
          console.log(`The following screenshots were removed: [ ${files.join(', ')} ]`);
      });

    }

  }

}
/////////////////////
// NEW SCREENSHOT
/////////////////////

else if (cmd === 'take') {

  if (!opt) {
    console.error('Command "take" requires a url but none was provided.');
    process.exit();
  }

  // Assume http.
  if (!opt.includes('//'))
    opt = 'http://' + opt;

  let hostname = (new URL(opt))
    .hostname;

  const format = argv.includes('--pdf') ? 'pdf' : 'png';
  const ext = '.' + format;

  opt2 = opt2 ? opt2.replace(/\..+$/, '') : opt2;

  (async () => {
    try {
      console.log('Launching...');
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const page = await browser.newPage();
      await page.goto(opt);
      if (format === 'pdf') {
        await page.pdf({ path: join(baseDir, opt2 || hostname + '.pdf'), format: 'A4' });
      }
      else {
        hostname = opt2 || hostname;
        await page.screenshot({ path: join(baseDir, hostname + '.png') });
      }
      await browser.close();
      console.log(`\nDone! saved ${hostname + ext}\n`);
    }
    catch (ex) {
      console.error(ex.message);
      process.exit();
    }
  })();

}
