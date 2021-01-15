// @ts-check

/* eslint-disable no-console */
const { REPORTING_LEVEL } = require('./constants.js');

/**
 * REPORT_LEVEL determines what is logged to the terminal during the build
 * 0 === none
 * 1 === errors only
 * 2 === all
 * default value of 1
 */
const error = REPORTING_LEVEL > 0 ? console.error : () => {};
const log = REPORTING_LEVEL >= 2 ? console.log : () => {};
const time = REPORTING_LEVEL >= 2 ? console.time : () => {};
const timeEnd = REPORTING_LEVEL >= 2 ? console.timeEnd : () => {};

// for messages and errors which must always be logged
const forceTime = console.time;
const forceTimeEnd = console.timeEnd;
const forceLog = console.log;
const forceError = console.error;
const extendedError = (reason = '', message = '') => {
  error(`======================\nERROR ${reason.toUpperCase()}:\n----------------------\n`);
  error(message);
  error(`\n----------------------\nThe above error was encountered ${reason}\n======================\n`);
};

module.exports = {
  error,
  log,
  forceLog,
  forceError,
  extendedError,
  time,
  timeEnd,
  forceTime,
  forceTimeEnd,
};
