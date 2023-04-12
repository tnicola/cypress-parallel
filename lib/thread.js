const { settings } = require('./settings.js')
const cypress = require('cypress')

/**
 * runs the thread for each parallel execution
 * @param {*} thread object with list of files and total weight
 * @param {*} index 
 * @returns a map of the duration and results for each test suite file
 */
async function executeThread(thread, index) {

  // legacy sleep. maybe can remove. need to test.
  // staggered start (when executed in container with xvfb ends up having a race condition causing intermittent failures)
  await new Promise((resolve) => setTimeout(resolve, index * 2000))

  const specFiles = `${thread.list.map(path => path).join(',')}`;
  const runObj = {
    spec: specFiles,
    reporter: settings.reporter,
    reporterOptions: settings.reporterOptions,
    browser: settings.browser,
    headless: settings.headless,
    quiet: !settings.isVerbose,
    env: {
      THREAD: (index + 1).toString(),
    },
  }
  if (settings.configFile) {
    runObj['configFile'] = settings.configFile
  } else {
    runObj['config'] = { video: false }
  }
  return cypress.run(runObj)

}

module.exports = {
  executeThread
};
