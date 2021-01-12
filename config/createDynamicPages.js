const { REGEX_INVALID_PATH_CHARS } = require('../ssr/utils/regex.js');
const { createTaxonomyPages, paginateNodes } = require('../ssr/utils/dynamicPageHelpers.js');

const BlogFeedPageTemplate = require('../frontend/pages/BlogFeed.svelte').default;
const CategoryPageTemplate = require('../frontend/pages/Category.svelte').default;
const CategoriesHomePageTemplate = require('../frontend/pages/Categories.svelte').default;
const TagPageTemplate = require('../frontend/pages/Tag.svelte').default;
const TagsHomePageTemplate = require('../frontend/pages/Tags.svelte').default;

/**
 * Create pages dynamically
 * @param {array} content all content nodes
 * @return {array} of new content nodes
 */
const createPages = (content) => {
  const getSlug = (name) => name.replace(REGEX_INVALID_PATH_CHARS, '').replace(/\s/g, '-');

  /**
   * Pagination: create a multipage blog feed
   */

  // Get and prepare nodes: filter based on the path and sort by the date. Return only the essential details
  const blogPosts = content
    .filter((node) => node.data.relPath.startsWith('blog/'))
    .sort((a, b) => {
      const dateA = (a.data.frontmatter && a.data.frontmatter.date) || '';
      const dateB = (b.data.frontmatter && b.data.frontmatter.date) || '';
      // newest first
      return dateA > dateB ? -1 : 1;
    })
    .map((node) => ({ path: node.data.relPath, frontmatter: node.data.frontmatter, seo: node.data.seo }));

  // create paginated blog feed Nodes
  const blogFeedNodes = paginateNodes({
    nodes: blogPosts,
    slugify: (i) => (i === 0 ? `/blog/index` : `/blog/page-${i + 1}`),
    perPage: 10,
    Component: BlogFeedPageTemplate,
  });

  /**
   * Taxonomies: CATEGORIES and TAGS
   */

  // Categories
  const [categoryHomeNode, ...categoryNodes] = createTaxonomyPages({
    nodes: blogPosts,
    slugify: (name) => `/blog/categories/${getSlug(name)}`,
    taxonomySlug: `/blog/categories/index`,
    getNodeTerms: (node) => [
      node.frontmatter && node.frontmatter.category ? String(node.frontmatter.category).toLowerCase() : 'uncategorized',
    ],
    Component: CategoryPageTemplate,
    TaxonomyComponent: CategoriesHomePageTemplate,
  });

  // Tags
  const [tagHomeNode, ...tagNodes] = createTaxonomyPages({
    nodes: blogPosts,
    slugify: (name) => `/blog/tags/${getSlug(name)}`,
    taxonomySlug: `/blog/tags/index`,
    getNodeTerms: (node) =>
      ((node.frontmatter && node.frontmatter.tags) || []).map((tagName) => String(tagName).toLowerCase()),
    Component: TagPageTemplate,
    TaxonomyComponent: TagsHomePageTemplate,
  });

  return [...blogFeedNodes, categoryHomeNode, ...categoryNodes, tagHomeNode, ...tagNodes];
};

module.exports = createPages;
