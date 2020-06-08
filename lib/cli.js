#!/usr/bin/env node

const [, , ...args] = process.argv;
console.log('ARGV ', args[0]);

const COMMAND = args[0];
if(!COMMAND){
    throw new Error('Expected command, e.g.: cypress-parallel \'npm run cypress\'');
}

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { spawn } = require('child_process');

let N_THREADS = 2;
const DAFAULT_WEIGHT = 1;
const SPEC_FILES_PATH = 'cypress/integration';
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
const WEIGHTS_JSON = 'cypress/parallel-weights.json';

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
    // NO file found --> it should happen at the first iteration
    //console.log('error', err);
  }

  console.log('SpecWeights', specWeights);

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
  console.log(weigths);
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
      const child = spawn('npm.cmd', [
       'run',
        //'cy:run',
        `${COMMAND}`,
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
          // log(`title: ${title}`);
        } else {
          try {
            // console.log(data, 'DATA');
            const test = JSON.parse(data);
            if (test[0] === 'pass') {
              // log(`✔ ${test[1].title}`);
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
              //log(timeMap);
            }
          } catch (error) {
            // console.log('Error while parsing', error, data);
          }
        }

        if (isResult) {
          result += data;
        }
        if (data.includes(regex)) {
          isResult = true;
        }
        if (!isResult) {
          //     console.log(`${command.color}${data}`);
        }
      });
      child.stderr.on('data', data => {
        // only for debug
        // console.log('\x1b[31m', `${data}`);
      });

      child.on('exit', () => {
        resolve(timeMap);
      });
    });
    children.push(promise);
  });

  let timeMap = new Map();
  Promise.all(children).then(resultMaps => {
    //  console.log('ALL RESULTS'); // Add proper color, data : color + string result
    resultMaps.forEach(m => {
      let totTimeThread = 0;
      for (let [name, test] of m) {
        totTimeThread += test.duration;
      }
      console.log(`Thread time: ${formatTime(totTimeThread)}`);

      timeMap = new Map([...timeMap, ...m]);
    });

    console.table(timeMap);
    let totalDuration = 0;
    let totalWeight = timeMap.size * 10;
    let specWeights = {};
    for (let [name, test] of timeMap) {
      totalDuration += test.duration;
      console.log(`Spec: ${name} -  Time ${formatTime(test.duration)}`);
      specWeights[name] = { time: test.duration, weight: 0 };
      // weights.push({ spec: name, weight: test.duration });
    }

    Object.keys(specWeights).forEach(spec => {
      specWeights[spec].weight = Math.floor(
        (specWeights[spec].time / totalDuration) * totalWeight
      );
    });

    console.log(`Total: ${formatTime(totalDuration)}`, totalDuration);

    const weightsJson = JSON.stringify(specWeights);
    fs.writeFile(`${WEIGHTS_JSON}`, weightsJson, 'utf8', err => {
      if (err) throw err;
      console.log('Generated file parallel-weights.json.');
    });
  });

};

start();
