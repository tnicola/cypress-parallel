const fs = require('fs')
const path = require('path')
const Table = require('cli-table3')
const colors = require('colors/safe.js')
const { settings } = require('./settings.js')

/**
 * 
 * @param {*} timeMs a ms or number
 * @returns stirng in time format. example 00:00
 */
const formatTime = function (timeMs) {
  const seconds = Math.ceil(timeMs / 1000);
  const sec = seconds % 60;
  const min = Math.floor(seconds / 60);
  let res = '';

  if (min) res += `${min}m `;
  res += `${sec}s`;
  return res;
};

/**
 * will check for an existing file and add or update the existing entries
 * if the file does not already exist then it will create a new one with the values from the current run
 * @param {*} resultMaps the results from the current run
 * @param {*} totalDuration the total duration from start to finish for the current run
 * @param {*} totalWeight number of tests * 10
 */
function generateWeightsFile(resultMaps, totalDuration, totalWeight) {
  let specWeights = {};
  resultMaps.forEach(r => {
    r.runs?.forEach(run => {
      specWeights[run.spec.relative] = { time: run.stats.duration, weight: 0 };
    })
  })

  let current = {}
  let weightsJSONContent = ''
  let updatedWeights
  // Check that the file exists locally first
  if (fs.existsSync(`${settings.weightsJSON}`)) {
    current = fs.readFileSync(`${settings.weightsJSON}`, 'utf8');
    console.log(`Pre-existing weights file ingested from ${settings.weightsJSON}`)
    // update file contents
    const parsedCurrent = JSON.parse(current)
    Object.keys(specWeights).forEach((spec) => {
      parsedCurrent[spec] = { weight: Math.floor((specWeights[spec].time / totalDuration) * totalWeight) }
    });
    updatedWeights = parsedCurrent
  }
  else {
    console.log("File not found");
    // create new file contents
    const newFile = {}
    Object.keys(specWeights).forEach((spec) => {
      newFile[spec] = { weight: Math.floor((specWeights[spec].time / totalDuration) * totalWeight) }
    });
    updatedWeights = newFile
  }
  // stringify the file with pretty formatting
  weightsJSONContent = JSON.stringify(updatedWeights, null, '\t');
  try {
    fs.writeFileSync(`${settings.weightsJSON}`, weightsJSONContent, 'utf8');
    console.log(`weights file updated at ${settings.weightsJSON}`)
  } catch (e) {
    console.error(e)
  }
}

/**
 * create the final table of results output to the cli
 * @param {*} resultMaps  a map or array of cypress results objects
 * @returns stats object with some combined stats for all of the results
 */
function generateAndLogResultsTable(resultMaps) {

  let totalTests = 0;
  let totalPasses = 0;
  let totalFailures = 0;
  let totalDuration = 0;
  let totalPending = 0;
  let totalSuites = 0
  resultMaps.forEach((m) => {
    totalDuration += m.totalDuration || 0
    totalFailures += m.totalFailed || 0
    totalPasses += m.totalPassed || 0
    totalPending += totalPending || 0
    totalTests += m.totalTests || 0
    totalSuites += m.runs?.length || 0
  });

  let table = new Table({
    head: ['Title', 'Total Time', 'Tests', 'Passing', 'Failing', 'Pending'],
    style: { head: ['blue'] },
    colWidths: [30, 12, 7, 9, 9, 9]
  });

  table.push([
    'Results for all threads combined',
    `${formatTime(totalDuration)}`,
    totalTests,
    totalPasses,
    totalFailures > 0 ? colors.red(totalFailures) : totalFailures,
    totalPending
  ]);

  console.log(table.toString());
  return { specs: totalSuites, duration: totalDuration, fails: totalFailures }
}

/**
 * in the event the results doesn't match the initial list of files output some info
 * @param {*} testSuitePaths list of files that were expected to be executed
 * @param {*} resultsMap array or map of cypress results objects
 * @param {*} totalTests total number of tests from there results
 * @returns void
 */
function handleMismatchedSuiteCount(testSuitePaths, resultsMap, totalTests) {
  if (totalTests < 1) { return }
  console.error(`Requested test suite list does not match the test suites from the results.`);
  console.error(`Requested test suites: ${testSuitePaths.length}`);
  console.error(`Test suites from the results: ${totalTests}`);
  console.error(
    'Some test suites likely terminated without passing on results, exit with error'
  );
  let resultPaths = []
  resultsMap.forEach(r => {
    r.runs?.forEach(run => {
      resultPaths.push(run.spec.relative)
    })
  })
  const missingTestResults = testSuitePaths.filter((path) => {
    !resultPaths.includes(path)
  });
  console.log(
    `paths found based on glob pattern: ${JSON.stringify(testSuitePaths)}
     paths reported as executed by cypress: ${JSON.stringify(resultPaths)}

     The following paths are not in both sets: 
    ${missingTestResults}`
  );
}

/**
 * using some stats generate the expected amount of time saved by running in parallel
 * @param {*} totalDuration 
 * @param {*} timeTaken 
 * @returns void
 */
function outputFinalDuration(totalDuration, timeTaken) {
  const timeSaved = totalDuration - timeTaken;
  if (timeSaved < 0) { return }
  const dur = formatTime(totalDuration)
  const tak = formatTime(timeTaken)
  const sav = formatTime(timeSaved)
  const per = Math.round((timeSaved / totalDuration) * 100)
  console.log(`Total run time: ${dur}, executed in: ${tak}, saved ${sav} (~${per}%)`);
}
module.exports = {
  formatTime,
  generateWeightsFile,
  handleMismatchedSuiteCount,
  outputFinalDuration,
  generateAndLogResultsTable,
};
