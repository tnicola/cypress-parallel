#!/usr/bin/env node
const Table = require('cli-table3');
const fs = require('fs');
const path = require('path');
const spawn = require('cross-spawn');
const yargs = require('yargs');
const { isYarn } = require('is-npm');

const argv = yargs
  .option('script', {
    alias: 's',
    type: 'string',
    description: 'Your npm Cypress command'
  })
  .option('threads', {
    alias: 't',
    type: 'number',
    description: 'Number of threads'
  })
  .option('specsDir', {
    alias: 'd',
    type: 'string',
    description: 'Cypress specs directory'
  })
  .option('args', {
    alias: 'a',
    type: 'string',
    description: 'Your npm Cypress command arguments'
  }).option('reporter', {
    alias: 'r',
    type: 'string',
    description: 'Reporter to pass to Cypress'
  }).option('reporterOptions', { 
    alias: 'o',
    type: 'string',
    description: 'Reporter options'
  }).argv;

const CY_SCRIPT = argv.script;
if (!CY_SCRIPT) {
  throw new Error('Expected command, e.g.: cypress-parallel <cypress-script>');
}

let N_THREADS = argv.threads ? argv.threads : 2;
const DAFAULT_WEIGHT = 1;
const SPEC_FILES_PATH = argv.specsDir ? argv.specsDir : 'cypress/integration';
const WEIGHTS_JSON = 'cypress/parallel-weights.json';
const CY_SCRIPT_ARGS = argv.args ? argv.args.split(' ') : []; 
const REPORTER = argv.reporter;
const REPORTER_OPTIONS = argv.reporterOptions;

const COLORS = [
  '\x1b[32m',
  '\x1b[36m',
  '\x1b[29m',
  '\x1b[33m',
  '\x1b[37m',
  '\x1b[38m',
  '\x1b[39m',
  '\x1b[40m'
];

const getAllFiles = dir =>
  fs.readdirSync(dir).reduce((files, file) => {
    const name = path.join(dir, file);
    const isDirectory = fs.statSync(name).isDirectory();
    if (isDirectory) return [...files, ...getAllFiles(name)];
    return [...files, name];
  }, []);

const logger = function(c) {
  const color = c;
  return function(message) {
    console.log(`${color}${message}`);
  };
};

const formatTime = function(timeMs) {
  const seconds = Math.ceil(timeMs / 1000);
  const sec = seconds % 60;
  const min = Math.floor(seconds / 60);
  let res = '';

  if (min) res += `${min}m `;
  res += `${sec}s`;
  return res;
};

const start = () => {
  const fileList = getAllFiles(SPEC_FILES_PATH);
  let specWeights = {};
  try {
    specWeights = JSON.parse(fs.readFileSync(WEIGHTS_JSON, 'utf8'));
  } catch (err) {
    console.log(`Weight file not found in path: ${WEIGHTS_JSON}`);
  }

  let map = new Map();
  for (let f of fileList) {
    let specWeight = DAFAULT_WEIGHT;
    Object.keys(specWeights).forEach(spec => {
      if (f.endsWith(spec)) {
        specWeight = specWeights[spec].weight;
      }
    });
    map.set(f, specWeight);
  }

  map = new Map([...map.entries()].sort((a, b) => b[1] - a[1]));

  // Reduce useless number of threads
  if (N_THREADS > fileList.length) {
    N_THREADS /= 2;
  }
  const weigths = [];
  for (let i = 0; i < N_THREADS; i++) {
    weigths.push({
      weight: 0,
      list: []
    });
  }

  for (const [key, value] of map.entries()) {
    weigths.sort((w1, w2) => w1.weight - w2.weight);
    weigths[0].list.push(key);
    weigths[0].weight += +value;
  }
  const commands = weigths.map((w, i) => ({
    color: COLORS[i],
    tests: `'${w.list.join(',')}'`
  }));

  const children = [];
  commands.forEach(command => {
    const promise = new Promise((resolve, reject) => {
      const timeMap = new Map();
      let suiteDuration = 0;

      const pckManager = isYarn
        ? 'yarn'
        : process.platform === 'win32'
          ? 'npm.cmd'
          : 'npm';
      
      const childOptions = [
        'run',
        `${CY_SCRIPT}`,
        isYarn ? '' :  '--',
        '--spec',
        command.tests
      ];

      if(REPORTER){
        childOptions.push('--reporter', REPORTER );
      }else{
        childOptions.push('--reporter', 'cypress-parallel/json-stream.reporter.js');
      }
      if(REPORTER_OPTIONS){
        childOptions.push('--reporter-options', REPORTER_OPTIONS);
      }
      childOptions.push(...CY_SCRIPT_ARGS);

      const child = spawn(pckManager, childOptions);
      if(child.stdout){
        if(REPORTER){
          child.stdout.pipe(process.stdout);
        }else{
          child.stdout.on('data', data => {
            try {
              const test = JSON.parse(data);
              if (test[0] === 'pass') {
                const testDuration = test[1].duration;
                suiteDuration += testDuration;
                console.log(
                  `\x1b[32m✔ \x1b[0m${test[1].title} (${testDuration}ms)`
                );
              }
              if (test[0] === 'fail') {
                console.log(`\x1b[31m✖ \x1b[0m${test[1].title} ( - ms)`);
                console.log(`\x1b[31m${test[1].err}`);
                console.log(`\x1b[31m${test[1].stack}`);
              }
              if (test[0] === 'suiteEnd' && test[1].title != null) {
                timeMap.set(test[1].title, { ...test[1], duration: suiteDuration });
              }
            } catch (error) {
              // No error logs
            }
          });
        }
      
      }
      if(child.stderr){
        child.stderr.on('data', data => {
          // only for debug purpose
          console.log('\x1b[31m', `${data}`);
        });
      }
      child.on('exit', () => {
        resolve(timeMap);
      });
    });
    children.push(promise);
  });

  let timeMap = new Map();
  Promise.all(children).then(resultMaps => {
    if(REPORTER){
      return;
    }
    resultMaps.forEach((m, t) => {
      let totTimeThread = 0;
      for (let [name, test] of m) {
        totTimeThread += test.duration;
      }
      console.log(`Thread ${t} time: ${formatTime(totTimeThread)}`);

      timeMap = new Map([...timeMap, ...m]);
    });

    let table = new Table({
      head: ['Spec', 'Time', 'Tests', 'Passing', 'Failing', 'Pending'],
      style: { head: ['green'] },
      colWidths: [50, 8, 7, 9, 9, 9]
    });

    let totalTests = 0;
    let totalPasses = 0;
    let totalDuration = 0;
    let totalPending = 0;

    let totalWeight = timeMap.size * 10;
    let specWeights = {};
    for (let [name, test] of timeMap) {
      totalDuration += test.duration;
      totalTests += test.tests;
      totalPasses += test.passes;
      totalPending += totalPending;
      specWeights[name] = { time: test.duration, weight: 0 };
      table.push([name, `${formatTime(test.duration)}`, test.tests, test.passes, test.failures, test.pending]);
    }
    table.push(["Results", `${formatTime(totalDuration)}`, totalTests, totalPasses, totalTests-totalPasses, totalPending]);

    console.log(table.toString());

    Object.keys(specWeights).forEach(spec => {
      specWeights[spec].weight = Math.floor(
        (specWeights[spec].time / totalDuration) * totalWeight
      );
    });

    if(totalTests - totalPasses){
      process.stderr.write('Test failures \n');
      process.exit(1);
    }
    const weightsJson = JSON.stringify(specWeights);
    fs.writeFile(`${WEIGHTS_JSON}`, weightsJson, 'utf8', err => {
      if (err) throw err;
      console.log('Generated file parallel-weights.json.');
    });
    
  });
};

start();
