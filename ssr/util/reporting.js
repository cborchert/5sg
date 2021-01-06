/* eslint-disable no-console */
const { REPORTING_LEVEL } = require('../constants.js');

/**
 * REPORT_LEVEL determines what is logged to the terminal during the build
 * 0 === none
 * 1 === errors only
 * 2 === all
 * default value of 1
 */
const error = REPORTING_LEVEL > 0 ? console.error : () => {};
const log = REPORTING_LEVEL >= 2 ? console.log : () => {};
// for messages and errors which must always be logged
const forceLog = console.log;
const forceError = console.error;

module.exports = {
  error,
  log,
  forceLog,
  forceError,
};
