const spawn = require('cross-spawn');
const { isYarn } = require('is-npm');

const { settings } = require('./settings');
const { sleep } = require('./utility');

function getPackageManager() {
  const pckManager = isYarn
    ? 'yarn'
    : process.platform === 'win32'
    ? 'npm.cmd'
    : 'npm';

  return pckManager;
}

function createProcessOptions(thread) {
  const command = `'${thread.list.join(',')}'`;
  const childOptions = [
    'run',
    `${settings.script}`,
    isYarn ? '' : '--',
    '--spec',
    command
  ];

  if (settings.reporter) {
    childOptions.push('--reporter', settings.reporter);
  }
  childOptions.push('--reporter', 'cypress-parallel/json-stream.reporter.js');
  if (settings.reporterOptions) {
    childOptions.push('--reporter-options', settings.reporterOptions);
  }
  childOptions.push(...settings.scriptArguments);

  return childOptions;
}

async function executeThread(thread, index) {
  const packageManager = getPackageManager();
  const processOptions = createProcessOptions(thread);

  // staggered start (when executed in container with xvfb ends up having a race condition causing intermittent failures)
  await sleep(index * 500);

  const timeMap = new Map();

  const promise = new Promise((resolve, reject) => {
    const child = spawn(packageManager, processOptions, { detached: true });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);

    child.on('exit', (exitCode) => {
      if (settings.isVerbose) {
        console.log(
          `Thread ${index} likely finished with failure count: ${exitCode}`
        );
      }
      // should preferably exit earlier, but this is simple and better than nothing
      if (settings.shouldBail) {
        if (exitCode > 0) {
          console.error(
            'BAIL set and thread exited with errors, exit early with error'
          );
          process.exit(exitcode);
        }
      }
      resolve(timeMap);
    });
  });

  return promise;
}

module.exports = {
  executeThread
};
