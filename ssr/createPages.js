const BlogFeedComponent = require('../frontend/pages/BlogFeed.svelte');

// TODO: while we don't want to bog people down with complexity, it would be nice to have a way to reinforce the `node` type
/**
 * As a reminder
 *
 * type node = {
 *    data: {
 *      draft: boolean,
 *      initialPath: string, // e.g. /Users/chris/5sg/content/404.svelte
 *      relPath: string, // e.g. 404.svelte
 *      fileName: string, // e.g. 404.svelte
 *      finalPath: string, // e.g. 404.html
 *      modified: string,
 *      created: string,
 *      template: undefined,
 *      seo: undefined, // must be handled by component
 *      frontmatter: {}, // frontmatter
 *    },
 *    contents: "" // processed html
 *    Component: SvelteComponent // used for rendering
 *  }
 */

/**
 * Create pages dynamically
 * @param {array} content all content nodes
 * @return {array} of new content nodes
 */
const createPages = (content) => {
  // example of pagination
  // create a multipage blog feed

  // Step 1: Get and prepare nodes
  // here we're filtering based on the path and sorting by the date and then getting just the essential details
  // TODO: use lodash/get or something similar
  const blogPosts = content
    .filter((node) => node.data.relPath.startsWith('blog/'))
    .sort((a, b) => {
      const dateA = (a.data.frontmatter && a.data.frontmatter.date) || '';
      const dateB = (b.data.frontmatter && b.data.frontmatter.date) || '';
      // newest first
      return dateA > dateB ? -1 : 1;
    })
    .map((node) => ({ path: node.data.relPath, frontmatter: node.data.frontmatter, seo: node.data.seo }));

  // Break the post up into chunks of 5
  // e.g. [[p1, p2, p3, p4, p5], [p6, p7]]
  const perPage = 5;
  const blogPostChunks = blogPosts
    .map((node, i) => (i % perPage === 0 ? blogPosts.slice(i, i + perPage) : null))
    .filter((a) => a);

  // create a linking mechanism
  // so that <a href="blog-page-1.dynamic">Page 1</a> will be replaced with the link to the final html
  const getPageSlug = (i) => `blog-page-${i + 1}.dynamic`;
  const blogFeedPagination = blogPostChunks.map((posts, i) => getPageSlug(i));
  const blogFeedNodes = blogPostChunks.map((posts, i) => ({
    data: {
      // props used for render
      // TODO -- use dynamicPath attribute as a replacement for initial and relPath
      initialPath: getPageSlug(i), // useful for reporting
      relPath: getPageSlug(i), // useful for reporting and linking
      finalPath: i === 0 ? `/blog/index.html` : `/blog/page-${i + 1}.html`,
      // props used in component
      posts,
      pageNumber: i + 1,
      numPages: blogPostChunks.length,
      pagination: blogFeedPagination,
    },
    // the rendering component
    Component: BlogFeedComponent.default,
  }));

  return [...blogFeedNodes];
};

module.exports = createPages;
