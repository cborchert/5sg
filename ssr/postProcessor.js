const unified = require('unified');
const visit = require('unist-util-visit');
const path = require('path');
const rehypeParse = require('rehype-parse');
const rehypeStringify = require('rehype-stringify');
const {
  REGEX_INVALID_PATH_CHARS,
  REGEX_TRAILING_SLASH,
  REGEX_LEADING_SLASH,
  REGEX_REL_DIR,
  REGEX_EXTERNAL_LINK,
} = require('./util/strings.js');

/**
 * A rehype plugin to replace relative links with absolute links
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const replaceRelativeLinks = () => (tree = {}, file = {}) => {
  const { cwd, path: filePath, dirname, nodeData = {} } = file;
  if (!cwd || !filePath || !dirname || cwd === path) {
    file.fail(
      `Path or cwd of processed file incorrectly set, got: ${JSON.stringify({
        cwd,
        path: filePath,
        dirname,
      })}`,
    );
    return;
  }

  // get relative path of file by removing cwd from path dirname
  const relDirname = dirname.replace(cwd.replace(REGEX_TRAILING_SLASH, ''), '');

  visit(tree, { tagName: 'a' }, ({ properties }) => {
    // We are resassigning a param variables, which is normally a bad practice,
    // but in this case we do want side effects 🤷‍♀️
    /* eslint-disable no-param-reassign */
    let { href = '' } = properties;

    // replace relative urls with urls relative to the output folder
    // remove any lead slashes
    // e.g. ../index.md in content/sub/sub2/test.md becomes sub/index.md
    // e.g. ./index.md in content/sub/sub2/test.md becomes sub/sub2/index.md
    if (REGEX_REL_DIR.test(href)) {
      href = path.join(relDirname, href);
    }

    // node information is stored without beginning slash, so we
    const hrefKey = href.replace(REGEX_LEADING_SLASH, '');

    // if the url exists in the map, use final url from the map
    // be forgiving -- with or without leading slash will do
    if (nodeData[hrefKey]) {
      href = nodeData[hrefKey].finalPath;
    } else if (nodeData[href]) {
      href = nodeData[href].finalPath;
    } else if (REGEX_EXTERNAL_LINK.test(href)) {
      // non-local files should open in a new tab
      properties.target = '_blank';
    }

    // update the url
    if (href !== properties.href) properties.href = href;
    /* eslint-enable no-param-reassign */
  });
};

/**
 * A rehype plugin to replace image links with correct image links, and to add them to the nodeMap for processing
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const replaceImageLinks = () => (tree = {}, file = {}) => {
  const { cwd, path: filePath, dirname, imageMap = {} } = file;
  if (!cwd || !filePath || !dirname || cwd === path) {
    file.fail(
      `Path or cwd of processed file incorrectly set, got: ${JSON.stringify({
        cwd,
        path: filePath,
        dirname,
      })}`,
    );
    return;
  }

  // get relative path of file by removing cwd from path dirname
  const relDirname = dirname.replace(cwd.replace(REGEX_TRAILING_SLASH, ''), '');

  visit(tree, { tagName: 'img' }, async ({ properties }) => {
    // We are resassigning a param variables, which is normally a bad practice,
    // but in this case we do want side effects 🤷‍♀️
    /* eslint-disable no-param-reassign */

    let { src = '' } = properties;
    let originalPath = '';
    if (src.startsWith('/')) {
      // create image map for srcs from the base directory
      // in this case, the src is used directly as the key
      originalPath = path.join(cwd, src);
      imageMap[originalPath] = { src };
    } else if (properties.src && REGEX_REL_DIR.test(properties.src)) {
      // deal with relative paths
      src = path.join(relDirname, properties.src);
      originalPath = path.join(cwd, src).replace(REGEX_INVALID_PATH_CHARS, '');
      imageMap[originalPath] = { src };
    }

    // update the url if necessary
    if (src !== properties.src) {
      properties.src = src;
    }

    // make the image lazy load
    properties.loading = 'lazy';
    /* eslint-enable no-param-reassign */
  });
};

// create a processor which will be used to parse or process a valid markdown string or file
const postProcessor = unified()
  // HTML to AST
  .use(rehypeParse)
  // Replace relative links
  .use(replaceRelativeLinks)
  // Better images
  .use(replaceImageLinks)
  // back to HTML
  .use(rehypeStringify)
  // TODO: minify the html (build only, this adds a few seconds to build time)
  // .use(require('rehype-preset-minify'))
  .freeze();

module.exports = postProcessor;
