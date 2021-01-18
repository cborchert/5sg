// @ts-check

/**
 * REGEX constants
 */

// matches final extension, including dot e.g. .html, .md, .mp4
const REGEX_EXTENSION = /(\.[^./]+)+$/;
// matches any non alpha numeric character, plus _, -, /, and .
const REGEX_INVALID_PATH_CHARS = /[^A-Za-z0-9_\-/.]/g;
// matches / and ./
const REGEX_CURR_DIR = /^\.?\//;
// matches strings starting in ./ ../
const REGEX_REL_DIR = /^\.?\.\//;
// matches final /
const REGEX_TRAILING_SLASH = /\/$/;
// matches beginning /
const REGEX_LEADING_SLASH = /^\//;
// matches several consecutive spaces
const REGEX_CONSEC_SPACE = /\s\s+/;
// matches trailing space
const REGEX_TRAILING_SPACE = /\s$/;
// matches any final non-alpha numeric characters
const REGEX_TRAILING_NON_ALPHA_NUMERICS = /[^A-Za-z0-9]+$/;
// matches links starting with http://, https://, file://, //, etc.
const REGEX_EXTERNAL_LINK = /^[A-Za-z0-9]*:?\/\//;

module.exports = {
  REGEX_EXTENSION,
  REGEX_INVALID_PATH_CHARS,
  REGEX_CURR_DIR,
  REGEX_TRAILING_SLASH,
  REGEX_LEADING_SLASH,
  REGEX_REL_DIR,
  REGEX_CONSEC_SPACE,
  REGEX_TRAILING_SPACE,
  REGEX_TRAILING_NON_ALPHA_NUMERICS,
  REGEX_EXTERNAL_LINK,
};
