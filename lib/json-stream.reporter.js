'use strict';
/**
 * @module JSONStreamCustom
 */
/**
 * Module dependencies.
 */
var Base = require('mocha/lib/reporters/base');
var constants = require('mocha/lib/runner').constants;
var path = require('path');
var fs = require('fs');

const { resultsPath } = require('./shared-config');

const { EVENT_SUITE_END } = constants;

/**
 * Expose `JSONStream`.
 */
exports = module.exports = JSONStreamCustom;

/**
 * Constructs a new `JSONStreamCustom` reporter instance.
 *
 * @public
 * @class
 * @memberof Mocha.reporters
 * @extends Mocha.reporters.Base
 * @param {Runner} runner - Instance triggers reporter actions.
 * @param {Object} [options] - runner options
 */
function JSONStreamCustom(runner, options) {
  Base.call(this, runner, options);
  var self = this;
  var total = runner.total;

  function cleanStatistics() {
    return {
      ...self.stats,
      duration: calculateDuration(self.stats.start, self.stats.end),
      file: self.runner.suite.file
    };
  }

  runner.on(EVENT_SUITE_END, function () {
    writeFile(cleanStatistics());
  });
}

function calculateDuration(start, end) {
  end = end || new Date();
  const duration = new Date(end).getTime() - new Date(start).getTime();
  return duration;
}

function writeFile(statistics) {
  // replace forward and backward slash with _ to generate filename
  const fileName = statistics.file.replace(/\\|\//g, '_');
  if (!fs.existsSync(resultsPath)) {
    fs.mkdirSync(resultsPath);
  }
  const specResultPath = path.join(resultsPath, `${fileName}.json`);
  fs.writeFileSync(specResultPath, JSON.stringify(statistics, null, 2));
}

JSONStreamCustom.description =
  'Writes statistics per spec file to result files';
