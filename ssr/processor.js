// @ts-check

/**  @todo implement types */
/**  @todo implement @ts-check */

const remark = require('remark');
const find = require('unist-util-find');
const visit = require('unist-util-visit');
const filter = require('unist-util-filter');
const frontmatter = require('remark-frontmatter');
const parseFrontmatter = require('remark-parse-frontmatter');
const html = require('remark-html');

const { EXTRACT_CHAR_LIMIT } = require('./utils/constants.js');
const { REGEX_CONSEC_SPACE, REGEX_TRAILING_SPACE, REGEX_TRAILING_NON_ALPHA_NUMERICS } = require('./utils/regex.js');
const { getPaths } = require('./utils/paths.js');
const { error } = require('./utils/reporting.js');

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
 * A remark plugin to extract the title and description from the frontmatter or content of a markdown file
 * Sets node.data.seo.title and node.data.seo.description
 *
 * @see https://unifiedjs.com/learn/guide/create-a-plugin/
 * @returns {Function} the plugin
 * @deprecated
 * @todo remove
 */
const extractSeo = () => (tree, file = {}) => {
  const { data = {} } = file;

  // init seo node in data
  data.seo = {};

  // extract title from frontmatter or content and set to data.seo.title
  if (data.frontmatter && data.frontmatter.title) {
    // use specified title from front matter
    data.seo.title = data.frontmatter.title;
  } else {
    // extract title from first heading
    const firstHeading = find(tree, { type: 'heading' });
    let titleText = '';
    if (firstHeading) {
      visit(firstHeading, 'text', (node) => {
        titleText = `${titleText} ${node.value} `;
      });
    }
    // remove double spaces and terminal space
    titleText = titleText.replace(REGEX_CONSEC_SPACE, ' ').replace(REGEX_TRAILING_SPACE, '');
    data.seo.title = titleText;
  }

  // extract excerpt / description and set to data.seo.description
  if (data.frontmatter && data.frontmatter.description) {
    // use specified description from front matter
    data.seo.description = data.frontmatter.description;
  } else if (data.frontmatter && data.frontmatter.excerpt) {
    // use specified excerpt from front matter
    data.seo.description = data.frontmatter.excerpt;
  } else {
    // extract description from non heading text nodes
    let descriptionText = '';

    /** @todo fixme */
    // @ts-ignore
    const yamlNode = filter(tree, (node) => node.type !== 'heading' && node.type !== 'yaml');
    if (yamlNode) {
      visit(yamlNode, 'text', (node) => {
        descriptionText = `${descriptionText} ${node.value} `;
      });
    }

    // remove double spaces and terminal space
    descriptionText = descriptionText.replace(REGEX_CONSEC_SPACE, ' ').replace(REGEX_TRAILING_SPACE, '');
    if (descriptionText.length > EXTRACT_CHAR_LIMIT) {
      // remove final characters and then add ellipses
      descriptionText = descriptionText.substr(0, EXTRACT_CHAR_LIMIT).replace(REGEX_TRAILING_NON_ALPHA_NUMERICS, '');
      descriptionText = `${descriptionText}...`;
    }
    data.seo.description = descriptionText;
  }
};

/**
 * A remark plugin to set node.data.draft
 *
 * @see https://unifiedjs.com/learn/guide/create-a-plugin/
 *
 * @returns {Function} the plugin
 */
const setIsDraft = () => (tree, file = {}) => {
  const { data = {} } = file;

  // init draft flag in data
  data.draft = !!(data.frontmatter && data.frontmatter.draft);
};

/**
 * A remark plugin to set node.data.template
 *
 * @see https://unifiedjs.com/learn/guide/create-a-plugin/
 *
 * @returns {Function} the plugin
 * */
const setTemplate = () => (tree, file = {}) => {
  const { data = {} } = file;
  data.template = (data.frontmatter && data.frontmatter.template) || 'Default';
};

/**
 * A remark plugin to set node.data.finalPath, node.data.initialPath, and node.data.relPath, and
 *
 * @see https://unifiedjs.com/learn/guide/create-a-plugin/
 *
 * @returns {Function} the plugin
 */
const setDataPaths = () => (tree, file = {}) => {
  const { data = {}, cwd, path: filePath } = file;

  // assign data all the path data
  const pathData = getPaths(filePath, cwd, data);
  Object.assign(data, pathData);
};

/**
 * A remark plugin to set node.data.created, node.data.modified, assuming that the info was provided using statSync
 *
 * @see https://unifiedjs.com/learn/guide/create-a-plugin/
 *
 * @returns {Function} the plugin
 */
const setFileInfo = () => (tree, file = {}) => {
  const { data = {}, info = {} } = file;
  data.modified = info.mtime;
  data.created = info.birthtime;
};

// Create a processor which will be used to parse or process a valid markdown string or file
// Define plugins
const standardPlugins = [
  { use: frontmatter, priority: 100 },
  { use: parseFrontmatter, priority: 95 },
  // NOTE: extractSeo is kind of useless and obscure. We can trust our users to add a title in the frontmatter and the API for svelte and other files should be the same.
  // { use: extractSeo, priority: 50 },
  /** @todo walking trees is an expensive operation -- any tree walkers should be combined if possible */
  { use: setIsDraft, priority: 50 },
  { use: setDataPaths, priority: 50 },
  { use: setFileInfo, priority: 50 },
  { use: setTemplate, priority: 50 },
  // should be the last thing to happen
  { use: html, priority: -100 },
];

// get custom defined plugins
const customPlugins = (config && config.processing && config.processing.plugins) || [];

// order plugins and extract their "use" props
const plugins = [...standardPlugins, ...customPlugins]
  .sort((a, b) => {
    try {
      const { priority: priorityA = 0 } = a;
      const { priority: priorityB = 0 } = b;
      return priorityA > priorityB ? -1 : 1;
    } catch (err) {
      error('ERROR with processor plugin definition while determining priority');
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
      error('ERROR with processor plugin definition: invalid "use" property');
      return null;
    }
  })
  .filter((a) => a);

// apply each plugin to the processor
const processor = plugins.reduce((prev, plugin) => {
  /** @todo technically, the .use method mutates the processor, so the return isn't necessary use a foreach? */
  return plugin ? prev.use(plugin) : prev;
}, remark());

module.exports = processor.freeze();
