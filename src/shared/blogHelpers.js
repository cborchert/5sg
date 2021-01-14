const { REGEX_INVALID_PATH_CHARS } = require('../../ssr/utils/regex.js');

const getSlug = (name) => name.replace(REGEX_INVALID_PATH_CHARS, '').replace(/\s/g, '-');

const getCategoryNames = (node) => [
  node.frontmatter && node.frontmatter.category ? String(node.frontmatter.category).toLowerCase() : 'uncategorized',
];
const getCategorySlug = (name) => `/blog/categories/${getSlug(name)}`;
const categoryHome = `/blog/categories/index`;

const getTagNames = (node) =>
  ((node.frontmatter && node.frontmatter.tags) || []).map((tagName) => String(tagName).toLowerCase());
const getTagSlug = (name) => `/blog/tags/${getSlug(name)}`;
const tagHome = `/blog/tags/index`;

module.exports = {
  getSlug,
  getCategoryNames,
  getCategorySlug,
  getTagNames,
  getTagSlug,
  tagHome,
  categoryHome,
};
