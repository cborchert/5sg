const remark = require('remark');
const find = require('unist-util-find');
const visit = require('unist-util-visit');
const filter = require('unist-util-filter');

const EXTRACT_LIMIT = 250;

/**
 * A remark plugin to extract the title and description from the frontmatter or content of a markdown file
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const extractSeo = () => (tree = {}, file = {}) => {
  const { data = {} } = file;

  // init seo node in data
  data.seo = {};

  // extract title
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
    titleText = titleText.replace(/\s\s+/, ' ').replace(/\s$/, '');
    data.seo.title = titleText;
  }

  // extract excerpt / description
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
    descriptionText = descriptionText.replace(/\s\s+/, ' ').replace(/\s$/, '');
    if (descriptionText.length > EXTRACT_LIMIT) {
      // remove final characters and then add ellipses
      descriptionText = descriptionText.substr(0, EXTRACT_LIMIT).replace(/[^A-Za-z0-9]+$/, '');
      descriptionText = `${descriptionText}...`;
    }
    data.seo.description = descriptionText;
  }
};

// create a processor which will be used to parse or process a valid markdown string or file
const processor = remark()
  .use(require('remark-frontmatter'))
  .use(require('remark-parse-frontmatter'))
  .use(extractSeo)
  .use(require('remark-html'))
  .freeze();

module.exports = processor;
