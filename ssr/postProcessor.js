/**  @todo implement types */
/**  @todo implement@ts-check */

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
  REGEX_EXTENSION,
} = require('./utils/regex.js');
const { error } = require('./utils/reporting.js');
const { getImageInfo } = require('./utils/io.js');

// conditionally include cofig
let config;
try {
  // eslint-disable-next-line global-require
  config = require('../config.js');
} catch (err) {
  error('ERROR: No config file in config.js');
  config = {};
}

/**
 * A rehype plugin to replace relative links with absolute links
 *
 * @see https://unifiedjs.com/learn/guide/create-a-plugin/
 *
 * @returns {Function} the plugin
 */
const replaceRelativeLinks = () => {
  return (tree, file = {}) => {
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

    const visitor = ({ properties }) => {
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
    };

    /** @todo fix me */
    // @ts-ignore
    visit(tree, { tagName: 'a' }, visitor);
  };
};

/**
 * A rehype plugin to replace image links with correct image links, and to add them to the nodeMap for processing
 *
 * @see https://unifiedjs.com/learn/guide/create-a-plugin/
 *
 * @returns {Function} the plugin
 */
const replaceImageLinks = () => (tree, file = {}) => {
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

  visit(tree, { tagName: 'img' }, (node) => {
    const { properties = {} } = node;
    // We are resassigning a param variables, which is normally a bad practice,
    // but in this case we do want side effects 🤷‍♀️
    /* eslint-disable no-param-reassign */

    let { src = '', width, height } = properties;
    let blurSrc = '';
    let originalPath = '';

    if (src.startsWith('/')) {
      // create image map for srcs from the base directory
      // in this case, the src is used directly as the key
      originalPath = path.join(cwd, src);
    } else if (properties.src && REGEX_REL_DIR.test(properties.src)) {
      // deal with relative paths
      // we'll be updating the sex
      src = path.join(relDirname, properties.src);
      originalPath = path.join(cwd, src).replace(REGEX_INVALID_PATH_CHARS, '');
    }

    if (imageMap[originalPath]) {
      // already processed; don't repeat yourself
      src = imageMap[originalPath].src;
      width = imageMap[originalPath].width;
      height = imageMap[originalPath].height;
      blurSrc = imageMap[originalPath].sizes && imageMap[originalPath].sizes.tiny;
    } else {
      // set the image map information
      const metadata = getImageInfo(originalPath);
      const extension = originalPath.match(REGEX_EXTENSION)[0];
      blurSrc = src.replace(REGEX_EXTENSION, `__tiny${extension}`);
      imageMap[originalPath] = { src, sizes: { full: src, tiny: blurSrc }, ...metadata };
      width = metadata.width;
      height = metadata.height;
    }

    // update the properties if necessary
    if (src !== properties.src) {
      properties.src = src;
    }
    if (blurSrc && src) {
      /** @todo only use when config says to, otherwise people might have a nasty surprise -- small images when they didn't want it! */
      properties.src = blurSrc;
      properties['data-lazy-src'] = src;
    }
    if (!properties.width) {
      properties.width = width;
    }
    if (!properties.height) {
      properties.height = height;
    }

    // make the image lazy load
    properties.loading = 'lazy';
    /* eslint-enable no-param-reassign */
  });
};

/**
 * A NOTE FROM THE CREATORS OF UNIFIED
 *  Walking the tree is an intensive task. Make use of the return values of the visitor when possible.
 *  Instead of walking a tree multiple times with different tests, walk it once without a test,
 *  and use unist-util-is to check if a node matches a test, and then perform different operations.
 *
 * @see https://github.com/syntax-tree/unist-util-visit-parents
 * @see https://github.com/syntax-tree/unist-util-visit-parents#next--visitornode-ancestors
 *
 * @todo maybe we DON'T need to switch back to AST before doing our work.
 * it could save a lot of processing time to be able to simply modify the HTML in place using string operations
 * in that case, we would not need to reconvert the AST back into HTML
 */

// create a processor which will be used to parse or process a valid markdown string or file
// Define plugins
const standardPlugins = [
  // HTML to AST
  // should be the first thing to happen
  { use: rehypeParse, priority: 100 },
  // Replace relative links
  { use: replaceRelativeLinks, priority: 50 },
  // Better images
  { use: replaceImageLinks, priority: 50 },
  // back to HTML
  // should be the last thing to happen
  { use: rehypeStringify, priority: 0 },
];

// get custom defined plugins
const customPlugins = (config && config.processing && config.postProcessing.plugins) || [];

// order plugins and extract their "use" props
const plugins = [...standardPlugins, ...customPlugins]
  .sort((a, b) => {
    try {
      const { priority: priorityA = 0 } = a;
      const { priority: priorityB = 0 } = b;
      return priorityA > priorityB ? -1 : 1;
    } catch (err) {
      error('ERROR with post processor plugin definition while determining priority');
      return 0;
    }
  })
  .map((plugin) => {
    try {
      const { use } = plugin;
      if (typeof use !== 'function' && typeof use !== 'object') {
        throw new Error('PLUGIN HAS NONFUNCTIONAL USE PROP');
      }
      return use;
    } catch (err) {
      error('ERROR with post processor plugin definition: invalid "use" property');
      return null;
    }
  })
  .filter((a) => a);

// apply each plugin to the processor
/** @todo technically, the .use method mutates the processor, so the return isn't necessary. use a foreach? */
const postProcessor = plugins.reduce((prev, plugin) => (plugin ? prev.use(plugin) : prev), unified());

module.exports = postProcessor.freeze();
