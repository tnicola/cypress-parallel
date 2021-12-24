'use strict';
/**
 * @module JSONStreamCustom
 */
/**
 * Module dependencies.
 */
var Base = require('mocha/lib/reporters/base');
var constants = require('mocha/lib/runner').constants;

const settings = JSON.parse(process.env.CY_PARALLEL_SETTINGS);

const {
  EVENT_TEST_PENDING,
  EVENT_TEST_FAIL,
  EVENT_TEST_PASS,
  EVENT_SUITE_BEGIN
} = constants;

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
  const { color, consoleLog } = Base;
  var self = this;
  let currentSuite = {};

  function getSuiteTitles() {
    let result = '';
    let current = currentSuite;
    while (current.parent) {
      result = `${current.title} - ${result}`;
      current = current.parent;
    }
    return result;
  }

  function getTestDescription(test) {
    return `${getSuiteTitles()}${test.title} (${self.runner.suite.file})`;
  }

  runner.on(EVENT_SUITE_BEGIN, function (suite) {
    currentSuite = suite;
  });

  runner.on(EVENT_TEST_PENDING, function (test) {
    const format = color('pending', '  - %s');
    consoleLog(format, getTestDescription(test));
  });

  runner.on(EVENT_TEST_FAIL, function (test) {
    const format = color('fail', '%s');
    if (settings.isVerbose) {
      consoleLog(format, {
        test: getTestDescription(test),
        error: test.err.stack,
      })
    } else {
      consoleLog(format, getTestDescription(test));
      }
    });

  runner.on(EVENT_TEST_PASS, function (test) {
    const format =
      color('checkmark', '  ' + Base.symbols.ok) +
      color('pass', ' %s') +
      color(test.speed, ' (%dms)');
    consoleLog(format, getTestDescription(test), test.duration);
  });
}

JSONStreamCustom.description =
  'Logs test results without need for them to be reported in the correct order';
