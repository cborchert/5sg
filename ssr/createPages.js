const { REGEX_INVALID_PATH_CHARS } = require('./util/strings.js');

const BlogFeedPageTemplate = require('../frontend/pages/BlogFeed.svelte').default;
const CategoryPageTemplate = require('../frontend/pages/Category.svelte').default;
const CategoriesHomePageTemplate = require('../frontend/pages/Categories.svelte').default;
const TagPageTemplate = require('../frontend/pages/Tag.svelte').default;
const TagsHomePageTemplate = require('../frontend/pages/Tags.svelte').default;

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
  // TODO: Create helper function for this -- basically finding members of a collection and then create a pagination

  // ///////////////////////////
  // BLOG FEED /////////////////
  // ///////////////////////////
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
    Component: BlogFeedPageTemplate,
  }));

  // TODO: Create helper function for this -- tags and categories are the same kind of operation, associating nodes with a classification,
  // then creating a page for each member of the classifier. The main difference is that a page can have one category and several tags

  // ///////////////////////////
  // CATEGORIES ////////////////
  // ///////////////////////////
  // create a linking mechanism
  // so that <a href="category-page-foo-bar.dynamic">Foo bar category</a> will be replaced with the link to the final html
  const getCategorySlug = (name) => name.replace(REGEX_INVALID_PATH_CHARS, '').replace(/\s/g, '-');
  const getCategoryDynamicPath = (name) => `category-page-${getCategorySlug(name)}.dynamic`;
  const categoryListPagePath = `categories-page.dynamic`;
  // Get a map of categories
  // e.g.
  // TODO: see if this exists in lodash
  // {
  //   test: { path: category-page-test.dynamic, posts: [p1, p2, p3, p4],},
  //   foo: { path: category-page-foo.dynamic, posts: [p5, p6],},
  //   uncategorized: { path: category-page-uncategorized.dynamic, posts: [p7, p8, p9],}, // <== generated for pages without categories
  // }
  const categories = blogPosts.reduce((prevCategories, node) => {
    const categoryName =
      node.frontmatter && node.frontmatter.category ? String(node.frontmatter.category).toLowerCase() : 'uncategorized';
    if (!prevCategories[categoryName]) {
      // eslint-disable-next-line no-param-reassign
      prevCategories[categoryName] = { path: getCategoryDynamicPath(categoryName), posts: [] };
    }
    prevCategories[categoryName].posts.push(node);
    return prevCategories;
  }, {});

  // create individual pages for each category
  const categoryNodes = Object.entries(categories).map(([categoryName, { path, posts }]) => ({
    data: {
      // props used for render
      // TODO -- use dynamicPath attribute as a replacement for initial and relPath
      initialPath: path, // useful for reporting
      relPath: path, // useful for reporting and linking
      finalPath: `/blog/category/${getCategorySlug(categoryName)}.html`,
      // props used in component
      posts,
      categories,
      name: categoryName,
      categoryHome: categoryListPagePath,
    },
    // the rendering component
    Component: CategoryPageTemplate,
  }));

  // create category home
  const categoryHomeNode = {
    data: {
      // props used for render
      // TODO -- use dynamicPath attribute as a replacement for initial and relPath
      initialPath: categoryListPagePath, // useful for reporting
      relPath: categoryListPagePath, // useful for reporting and linking
      finalPath: `/blog/categories.html`,
      // props used in component

      categories,
    },
    // the rendering component
    Component: CategoriesHomePageTemplate,
  };

  // ///////////////////////////
  // TAGS //////////////////////
  // ///////////////////////////
  // create a linking mechanism
  // so that <a href="category-page-foo-bar.dynamic">Foo bar category</a> will be replaced with the link to the final html
  const getTagSlug = (name) => name.replace(REGEX_INVALID_PATH_CHARS, '').replace(/\s/g, '-');
  const getTagDynamicPath = (name) => `tag-page-${getCategorySlug(name)}.dynamic`;
  const tagListPagePath = `tag-page.dynamic`;
  // Get a map of tags
  const tags = blogPosts.reduce((prevTags, node) => {
    // TODO: here, we're assuming it's an array. Do some type checking
    const tagNames = node.frontmatter && node.frontmatter.tags ? node.frontmatter.tags : [];
    tagNames.forEach((tag = '') => {
      const tagName = String(tag).toLowerCase();
      if (!prevTags[tagName]) {
        // eslint-disable-next-line no-param-reassign
        prevTags[tagName] = { path: getTagDynamicPath(tagName), posts: [] };
      }
      prevTags[tagName].posts.push(node);
    });

    return prevTags;
  }, {});

  // create individual pages for each tag
  const tagNodes = Object.entries(tags).map(([tagName, { path, posts }]) => ({
    data: {
      // props used for render
      // TODO -- use dynamicPath attribute as a replacement for initial and relPath
      initialPath: path, // useful for reporting
      relPath: path, // useful for reporting and linking
      finalPath: `/blog/tag/${getTagSlug(tagName)}.html`,
      // props used in component
      posts,
      tags,
      name: tagName,
      tagsHome: tagListPagePath,
    },
    // the rendering component
    Component: TagPageTemplate,
  }));

  // create tag home
  const tagHomeNode = {
    data: {
      // props used for render
      // TODO -- use dynamicPath attribute as a replacement for initial and relPath
      initialPath: tagListPagePath, // useful for reporting
      relPath: tagListPagePath, // useful for reporting and linking
      finalPath: `/blog/tags.html`,
      // props used in component
      tags,
    },
    // the rendering component
    Component: TagsHomePageTemplate,
  };

  return [...blogFeedNodes, ...categoryNodes, categoryHomeNode, ...tagNodes, tagHomeNode];
};

module.exports = createPages;
