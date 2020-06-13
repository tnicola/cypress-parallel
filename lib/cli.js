#!/usr/bin/env node
const Table = require('cli-table');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const [, , ...args] = process.argv;

const CY_SCRIPT = args[0];
if (!CY_SCRIPT) {
  throw new Error('Expected command, e.g.: cypress-parallel <cypress-script>');
}

let N_THREADS = args[1] ? args[1] : 2;
const DAFAULT_WEIGHT = 1;
const SPEC_FILES_PATH = 'cypress/integration';
const WEIGHTS_JSON = 'cypress/parallel-weights.json';

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

  // console.log('SpecWeights', specWeights);

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
  // console.log(weigths);
  const commands = weigths.map((w, i) => ({
    color: COLORS[i],
    tests: `'${w.list.join(',')}'`
  }));

  const regex = 'Run Finished';
  const titleRegexp = /(Running:  )(.+\.ts|.+\.js)/;
  const children = [];
  commands.forEach(command => {
    const promise = new Promise((resolve, reject) => {
      const timeMap = new Map();
      const log = logger(command.color);
      let result = '';
      let title = '';
      let isResult = false;
      const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', [
        'run',
        //'cy:run',
        `${CY_SCRIPT}`,
        '--',
        '--reporter',
        'json-stream',
        '--spec',
        command.tests
      ]);

      child.stdout.on('data', data => {
        data += '';
        // Useful for debugging?
        // console.log('data', data);
        if (titleRegexp.test(data)) {
          // console.log('data', data);
          title = data.match(titleRegexp)[2];
        } else {
          try {
            // console.log(data, 'DATA');
            const test = JSON.parse(data);
            if (test[0] === 'pass') {
              console.log(
                `\x1b[32m✔ \x1b[0m${test[1].title} (${test[1].duration}ms)`
              );
            }
            if (test[0] === 'fail') {
              console.log(`\x1b[31m✖ \x1b[0m${test[1].title} ( - ms)`);
              console.log(`\x1b[31m${test[1].err}`);
              console.log(`\x1b[31m${test[1].stack}`);
            }
            if (test[0] === 'end') {
              timeMap.set(title, test[1]);
            }
          } catch (error) {
            // No error logs
          }
        }

        if (isResult) {
          result += data;
        }
        if (data.includes(regex)) {
          isResult = true;
        }
      });
      child.stderr.on('data', data => {
        // only for debug purpose
        console.log('\x1b[31m', `${data}`);
      });

      child.on('exit', () => {
        resolve(timeMap);
      });
    });
    children.push(promise);
  });

  let timeMap = new Map();
  Promise.all(children).then(resultMaps => {
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
      colWidths: [25, 8, 7, 9, 9, 9]
    });

    let totalDuration = 0;
    let totalWeight = timeMap.size * 10;
    let specWeights = {};
    for (let [name, test] of timeMap) {
      totalDuration += test.duration;
      specWeights[name] = { time: test.duration, weight: 0 };
      table.push([
        name,
        `${formatTime(test.duration)}`,
        test.tests,
        test.passes,
        test.failures,
        test.pending
      ]);
    }

    console.log(table.toString());

    Object.keys(specWeights).forEach(spec => {
      specWeights[spec].weight = Math.floor(
        (specWeights[spec].time / totalDuration) * totalWeight
      );
    });

    // console.log(`Total: ${formatTime(totalDuration)}`, totalDuration);

    const weightsJson = JSON.stringify(specWeights);
    fs.writeFile(`${WEIGHTS_JSON}`, weightsJson, 'utf8', err => {
      if (err) throw err;
      console.log('Generated file parallel-weights.json.');
    });
  });
};

start();
