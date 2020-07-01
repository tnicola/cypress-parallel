'use strict';
/**
 * @module JSONStreamCustom
 */
/**
 * Module dependencies.
 */
var Base = require('mocha/lib/reporters/base');
var constants = require('mocha/lib/runner').constants;
var EVENT_TEST_PASS = constants.EVENT_TEST_PASS;
var EVENT_TEST_FAIL = constants.EVENT_TEST_FAIL;
var EVENT_RUN_BEGIN = constants.EVENT_RUN_BEGIN;
var EVENT_SUITE_END = constants.EVENT_SUITE_END;

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
  runner.once(EVENT_RUN_BEGIN, function() {
    writeEvent(['start', { total: total }]);
  });
  runner.on(EVENT_TEST_PASS, function(test) {
    writeEvent(['pass', clean(test)]);
  });
  runner.on(EVENT_TEST_FAIL, function(test, err) {
    test = clean(test);
    test.err = err.message;
    test.stack = err.stack || null;
    writeEvent(['fail', test]);
  });

  runner.on(EVENT_SUITE_END, function(suite) {
    writeEvent(['suiteEnd', cleanSuite(suite, self.stats)]);
  });
}
/**
 * Mocha event to be written to the output stream.
 * @typedef {Array} JSONStream~MochaEvent
 */
/**
 * Writes Mocha event to reporter output stream.
 *
 * @private
 * @param {JSONStreamCustom~MochaEvent} event - Mocha event to be output.
 */
function writeEvent(event) {
  process.stdout.write(JSON.stringify(event) + '\n');
}
/**
 * Returns an object literal representation of `test`
 * free of cyclic properties, etc.
 *
 * @private
 * @param {Test} test - Instance used as data source.
 * @return {Object} object containing pared-down test instance data
 */
function clean(test) {
  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    file: test.file,
    duration: test.duration,
    currentRetry: test.currentRetry()
  };
}

function cleanSuite(suite, stats) {
  return {
    ...stats,
    title: suite.file
  };
}
JSONStreamCustom.description = 'JSONStream customized reporter';
