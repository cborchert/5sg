const remark = require('remark');
const find = require('unist-util-find');
const visit = require('unist-util-visit');
const filter = require('unist-util-filter');
const frontmatter = require('remark-frontmatter');
const parseFrontmatter = require('remark-parse-frontmatter');
const html = require('remark-html');

const { EXTRACT_LIMIT } = require('./constants.js');
const {
  REGEX_CONSEC_SPACE,
  REGEX_TRAILING_SPACE,
  REGEX_TRAILING_NON_ALPHA_NUMERICS,
  REGEX_EXTENSION,
  REGEX_INVALID_PATH_CHARS,
  REGEX_CURR_DIR,
  REGEX_LEADING_SLASH,
} = require('./util/strings.js');

/**
 * A remark plugin to extract the title and description from the frontmatter or content of a markdown file
 * Sets node.data.seo.title and node.data.seo.description
 *
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const extractSeo = () => (tree = {}, file = {}) => {
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
    const yamlNode = filter(tree, (node) => node.type !== 'heading' && node.type !== 'yaml');
    if (yamlNode) {
      visit(yamlNode, 'text', (node) => {
        descriptionText = `${descriptionText} ${node.value} `;
      });
    }

    // remove double spaces and terminal space
    descriptionText = descriptionText.replace(REGEX_CONSEC_SPACE, ' ').replace(REGEX_TRAILING_SPACE, '');
    if (descriptionText.length > EXTRACT_LIMIT) {
      // remove final characters and then add ellipses
      descriptionText = descriptionText.substr(0, EXTRACT_LIMIT).replace(REGEX_TRAILING_NON_ALPHA_NUMERICS, '');
      descriptionText = `${descriptionText}...`;
    }
    data.seo.description = descriptionText;
  }
};

/**
 * A remark plugin to set node.data.draft
 *
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const setIsDraft = () => (tree, file = {}) => {
  const { data = {} } = file;

  // init draft flag in data
  data.draft = !!(data.frontmatter && data.frontmatter.draft);
};

/**
 * A remark plugin to set node.data.finalPath, node.data.initialPath, and node.data.relPath, and
 *
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const setDataPaths = () => (tree, file = {}) => {
  const { data = {}, cwd, path: filePath } = file;
  const relPath = filePath.replace(cwd, '');

  let outputPathBase = relPath.replace(REGEX_EXTENSION, '').replace(REGEX_INVALID_PATH_CHARS, '');

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

  // TODO: use path package??
  data.finalPath = `${outputPathBase}.html`;
  data.initialPath = filePath;
  data.relPath = relPath;
  const lastSlash = relPath.lastIndexOf('/');
  data.fileName = relPath
    .substr(lastSlash === -1 ? 0 : lastSlash)
    .replace(REGEX_EXTENSION, '')
    .replace(REGEX_LEADING_SLASH, '');
};

/**
 * A remark plugin to set node.data.created, node.data.modified, assuming that the info was provided using statSync
 *
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const setFileInfo = () => (tree, file = {}) => {
  const { data = {}, info = {} } = file;
  data.modified = info.mtime;
  data.created = info.birthtime;
};

// create a processor which will be used to parse or process a valid markdown string or file
const processor = remark()
  .use(frontmatter)
  .use(parseFrontmatter)
  .use(extractSeo)
  .use(setIsDraft)
  .use(setDataPaths)
  .use(setFileInfo)
  .use(html)
  .freeze();

module.exports = processor;
