#!/usr/bin/env node

const { settings } = require('./settings.js')
const {
  getTestSuitePaths,
  distributeTestsByWeight
} = require('./test-suites.js')
const {
  handleMismatchedSuiteCount,
  outputFinalDuration,
  generateAndLogResultsTable,
  generateWeightsFile
} = require('./utility.js')
const { executeThread } = require('./thread.js')

/**
 * run the tests in threads
 */
async function startThreads() {
  const testSuitePaths = await getTestSuitePaths()
  if (testSuitePaths.length < 1) { console.error(`no suites found at path ${settings.sepcsDir}`); process.exit(1) }
  const threads = distributeTestsByWeight(testSuitePaths);
  if (settings.dryRun) {
    console.log('Dry run, not starting a new run')
    console.log('paths-----------------------------------------')
    console.log(testSuitePaths)
    console.log('threads---------------------------------------')
    console.log(threads)
  } else {
    const start = new Date();
    const resultMaps = await Promise.all(threads.map(executeThread));
    const timeTaken = new Date().getTime() - start.getTime();
    const stats = generateAndLogResultsTable(resultMaps)
    if (stats.specs < 1) {
      console.error('no tests executed')
      process.exit(1)
    }
    generateWeightsFile(resultMaps, stats.duration, stats.specs * 10);
    outputFinalDuration(stats.duration, timeTaken)
    if (stats.fails > 0) {
      console.error(`${stats.fails} test failure(s)`);
    }
    // fail on missing results (had some issues with missing test results, prevent that from slipping past again)
    // I got this error when a glob pattern included a non-file as an expanded path
    if (settings.strictMode && stats.specs !== testSuitePaths.length) {
      handleMismatchedSuiteCount(testSuitePaths, resultMaps, stats.specs)
      process.exit(1);
    }
    if (stats.fails > 0) {
      process.exit(1);
    }
    process.exit(0);
  }
}
startThreads()