// @ts-check

const { REGEX_EXTENSION, REGEX_INVALID_PATH_CHARS, REGEX_CURR_DIR, REGEX_LEADING_SLASH } = require('./regex.js');

/**
 * Get the useful file paths for the given file
 *
 * @param {string} filePath entire the path of the file
 * @param {string} cwd the current working directory of the operation
 * @param {Object=} data the additional file meta data
 * @returns {{relPath: string, initialPath: string, finalPath: string, fileName: string}} the data
 */
const getPaths = (filePath, cwd, data = {}) => {
  const relPath = filePath.replace(cwd, '');

  let outputPathBase = relPath.replace(REGEX_EXTENSION, '').replace(REGEX_INVALID_PATH_CHARS, '');

  /** @todo this needs to be fixed -- data.frontmatter does not exist */
  // allow for custom path, properly formatted, retrieved from path, permalink, slug, or route in the frontmatter
  const frontmatterPath = data.frontmatter
    ? data.frontmatter.permalink || data.frontmatter.path || data.frontmatter.route || data.frontmatter.slug
    : '';
  if (frontmatterPath) {
    // remove leading ./ or /, the extension, and invalid path chars
    outputPathBase = frontmatterPath
      .replace(REGEX_CURR_DIR, '')
      .replace(REGEX_EXTENSION, '')
      .replace(REGEX_INVALID_PATH_CHARS, '');
  }

  /** @todo use path package?? */
  data.finalPath = `/${outputPathBase}.html`;
  data.initialPath = filePath;
  data.relPath = relPath;
  const lastSlash = relPath.lastIndexOf('/');
  data.fileName = relPath
    .substr(lastSlash === -1 ? 0 : lastSlash)
    .replace(REGEX_EXTENSION, '')
    .replace(REGEX_LEADING_SLASH, '');

  return data;
};

module.exports = { getPaths };
