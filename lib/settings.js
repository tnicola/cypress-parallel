const yargs = require('yargs')
const path = require('path')

const argv = yargs
  .parserConfiguration({ 'duplicate-arguments-array': false })
  .option('dry', {
    alias: 'y',
    type: 'boolean',
    default: false,
    description: 'generates the list of files and threads but does not start the run'
  })
  .option('threads', {
    alias: 't',
    type: 'number',
    default: 2,
    description: 'Number of threads'
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    default: false,
    description: 'Execute with verbose logging'
  })
  .option('specsDir', {
    alias: 'd',
    type: 'string',
    default: 'cypress/integration/**/**',
    description: 'Cypress specs directory'
  })
  .option('reporter', {
    alias: 'r',
    type: 'string',
    default: 'cypress-multi-reporters',
    description: 'reporter to use with Cypress'
  })
  .option('reporterOptions', {
    alias: 'o',
    type: 'string',
    default: 'reporter-config.json',
    description: 'additional custom reporter options'
  })
  .option('strictMode', {
    alias: 'm',
    type: 'boolean',
    default: true,
    description: 'Strict mode checks'
  })
  .option('weightsJson', {
    alias: 'w',
    type: 'string',
    default: './cypress/parallel-weights.json',
    description: 'Parallel weights json file'
  })
  .option('configFile', {
    type: 'string',
    description: 'path to a cypress config file'
  })
  .option('headless', {
    type: 'boolean',
    default: true,
    description: 'headless execution'
  })
  .option('browser', {
    type: 'string',
    default: 'chrome',
    description: 'browser to user - chrome, electron, etc'
  }).argv

const settings = {
  defaultWeight: 1,
  dryRun: argv.dry,
  threadCount: argv.threads,
  isVerbose: argv.verbose,
  testSuitesPath: argv.specsDir,
  reporter: argv.reporter,
  reporterOptions: `configFile=${path.join(process.cwd(), argv.reporterOptions)}`,
  strictMode: argv.strictMode,
  weightsJSON: argv.weightsJson,
  configFile: argv.configFile,
  headless: argv.headless,
  browser: argv.browser,
}

module.exports = {
  settings
}
