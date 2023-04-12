const fs = require('fs')
const { settings } = require('./settings')
const { glob } = require('glob')

/**
 * using glob to get the list of files to distribute between threads
 * @returns the list of test suites or files as an array
 */
async function getTestSuitePaths() {
  let fileList = []
  const g = await glob(settings.testSuitesPath, { ignore: 'node_modules/**' })
  for (const file of g) {
    fileList.push(file)
  }
  let finalFileList = []
  fileList.forEach((f => { if (['.js', '.ts'].includes(f.substring(f.length - 3))) { finalFileList.push(f) } }))

  console.log(`${finalFileList.length} test suite(s) found.`);
  if (settings.isVerbose) {
    console.log('Paths to found suites');
    console.log(JSON.stringify(finalFileList, null, 2));
  }

  // We can't run more threads than suites
  if (finalFileList.length < settings.threadCount) {
    console.log(`Thread setting is ${settings.threadCount}, but only ${finalFileList.length} test suite(s) were found. Adjusting configuration accordingly.`)
    settings.threadCount = finalFileList.length
  }

  return finalFileList;
}
/**
 * create the threads using the file list and weights file
 * if no file then naively assume all are the same weight and 
 *  split them evenly between theads
 * @param {*} testSuitePaths array of test file paths
 * @returns 
 */
function distributeTestsByWeight(testSuitePaths) {
  let specWeights = {};
  try {
    specWeights = JSON.parse(fs.readFileSync(settings.weightsJSON, 'utf8'));
  } catch (err) {
    console.log(`Weight file not found in path: ${settings.weightsJSON}`);
  }

  const map = testSuitePaths.map(f => {
    return { spec: f, weight: settings.defaultWeight }
  })
  Object.keys(specWeights).forEach((spec) => {
    if (map.spec === spec && typeOf(specWeights[spec].weight) === 'Number') {
      map.weight = specWeights[spec].weight
    }
  })

  const threads = []
  for (let i = 0; i < settings.threadCount; i++) {
    threads.push({ list: [], weight: 0 });
  }
  map.forEach(m => {
    // sort the combined threads by weight so that the fastest is always at the first position
    threads.sort((w1, w2) => w1.weight - w2.weight);
    threads[0].list.push(m.spec);
    threads[0].weight += m.weight;
  })

  // Run slowest group first
  return threads.reverse()
}

module.exports = {
  getTestSuitePaths,
  distributeTestsByWeight
};
