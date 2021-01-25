const { createTaxonomyPages, paginateNodes } = require('../../ssr/utils/dynamicPageHelpers.js');
const {
  getCategoryNames,
  getTagNames,
  getCategorySlug,
  getTagSlug,
  tagHome,
  categoryHome,
} = require('../shared/blogHelpers.js');

const BlogFeedPageTemplate = require('../client/pages/BlogFeed.svelte');
const CategoryPageTemplate = require('../client/pages/Category.svelte');
const CategoriesHomePageTemplate = require('../client/pages/Categories.svelte');
const TagPageTemplate = require('../client/pages/Tag.svelte');
const TagsHomePageTemplate = require('../client/pages/Tags.svelte');

/**
 * Create pages dynamically
 *
 * @param {Array} content all content nodes
 * @returns {Array} of new content nodes
 */
const createPages = (content) => {
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
    .map((node) => ({ path: node.data.relPath, frontmatter: node.data.frontmatter }));

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
    slugify: getCategorySlug,
    taxonomySlug: categoryHome,
    getNodeTerms: getCategoryNames,
    Component: CategoryPageTemplate,
    TaxonomyComponent: CategoriesHomePageTemplate,
  });

  // Tags
  const [tagHomeNode, ...tagNodes] = createTaxonomyPages({
    nodes: blogPosts,
    slugify: getTagSlug,
    taxonomySlug: tagHome,
    getNodeTerms: getTagNames,
    Component: TagPageTemplate,
    TaxonomyComponent: TagsHomePageTemplate,
  });

  return [...blogFeedNodes, categoryHomeNode, ...categoryNodes, tagHomeNode, ...tagNodes];
};

module.exports = createPages;
