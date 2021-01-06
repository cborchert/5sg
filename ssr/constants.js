require('dotenv').config();
const path = require('path');

// get the arguments used to execute the file,
// example:
// > node build.js TEST=true DEV=1
//   returns {TEST="true", DEV="1"}
const processArgMap = Object.fromEntries(process.argv.slice(2).map((argument) => argument.split('=')));

// If IS_DEV, then we launch an express server on the designated PORT to serve the static files
const IS_DEV =
  !!processArgMap.DEV || (typeof process.env.NODE_ENV !== 'undefined' && process.env.NODE_ENV !== 'production');
const PORT = process.env.PORT || 3000;

/**
 * REPORT_LEVEL determines what is logged to the terminal during the build
 * 0 === none
 * 1 === errors only
 * 2 === all
 * default value of 1
 */
const REPORTING_LEVEL = processArgMap.REPORTING_LEVEL ? Number(processArgMap.REPORTING_LEVEL) : 1;

// the base directory of the project
const BASE_DIR = path.join(__dirname, '../');

// NOTE: For security reasons, all for *_DIR are relative to the base directory of this project.
//  This means that you cannot designate a content or build folder outside of this project.

// where should we look for the content?
const CONTENT_DIR = path.join(BASE_DIR, process.env.CONTENT_DIR || './content/');
// where should we build the finished files?
const BUILD_DIR = path.join(BASE_DIR, process.env.BUILD_DIR || './build/');

// where should we find static files (which will be copied without processing to the build directory)?
const STATIC_DIR = path.join(BASE_DIR, process.env.STATIC_DIR || './static/');
// where should we copy static files to?
const BUILD_STATIC_DIR = path.join(BUILD_DIR, process.env.STATIC_DIR || './static/');

// what is the character limit for generating the extract text of a page?
const EXTRACT_CHAR_LIMIT = process.env.EXTRACT_CHAR_LIMIT || 250;

// If RENDER_DRAFTS !== true, then we will not publish content that has `draft: true` in the frontmatter
const RENDER_DRAFTS = typeof process.env.RENDER_DRAFTS === 'undefined' ? false : process.env.RENDER_DRAFTS;

module.exports = {
  IS_DEV,
  PORT,
  BASE_DIR,
  BUILD_DIR,
  BUILD_STATIC_DIR,
  STATIC_DIR,
  CONTENT_DIR,
  REPORTING_LEVEL,
  EXTRACT_CHAR_LIMIT,
  RENDER_DRAFTS,
  processArgMap,
};
