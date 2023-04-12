'use strict';
/**
 * @module SimpleSpecCustom
 */
/**
 * Module dependencies.
 */
const Base = require('mocha/lib/reporters/base')
const Runner = require('mocha/lib/runner')

const EVENT_TEST_FAIL = Runner.constants.EVENT_TEST_FAIL;
const EVENT_TEST_PENDING = Runner.constants.EVENT_TEST_PENDING;
const EVENT_TEST_PASS = Runner.constants.EVENT_TEST_PASS;
const EVENT_SUITE_BEGIN = Runner.constants.EVENT_SUITE_BEGIN;

/**
 * Expose `SimpleSpecCustom`.
 */
exports = module.exports = SimpleSpecCustom;

/**
 * Constructs a new `SimpleSpecCustom` reporter instance.
 *
 * @public
 * @class
 * @memberof Mocha.reporters
 * @extends Mocha.reporters.Base
 * @param {Runner} runner - Instance triggers reporter actions.
 * @param {Object} [options] - runner options
 */
function SimpleSpecCustom(runner, options) {
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
    consoleLog(format, getTestDescription(test));
  });

  runner.on(EVENT_TEST_PASS, function (test) {
    const format =
      color('checkmark', '  ' + Base.symbols.ok) +
      color('pass', ' %s') +
      color(test.speed, ' (%dms)');
    consoleLog(format, getTestDescription(test), test.duration);
  });
}

SimpleSpecCustom.description =
  'Logs test results without need for them to be reported in the correct order';
