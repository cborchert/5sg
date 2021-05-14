import '../../src/types/typedefs.js';

/**
 * Formats a name to a dynamic slug which can be universally recognized
 * @param {string} name the page name
 * @returns {string} the dynamic slug
 */
export const getDynamicSlugFromName = (name) => `${name}.dynamic`;

/**
 * Given an array of nodes, returns an array paginated nodes to be rendered
 * @param {Array<NodeMetaEntry>} nodes the collection of nodes
 * @param {object} config the pagination config
 * @param {number=} config.perPage the number of nodes to put on a single page
 * @param {(i:number)=>string=} config.slugify a function to transform the page number into the slug/path/unique key of the page
 * @param {string=} config.component the component to render each page
 * @returns {Array<RenderablePage>} the paginated node collection
 */
export const paginateNodeCollection = (nodes, { perPage = 10, slugify = (i) => `${i}`, component } = {}) => {
  // split the nodes array up into paged chunks
  /** @type {Array<Array<NodeMetaEntry>>} an array of node arrays each containing at max n nodes, where n === perPage */
  const pages = nodes.map((node, i) => (i % perPage === 0 ? nodes.slice(i, i + perPage) : null)).filter((a) => a);

  // create a slug to identify the new page node,
  // and so that <a href="blog-page-1.dynamic">Page 1</a> will be replaced with the link to the final html
  const pageSlugs = pages.map((pageNodes, i) => getDynamicSlugFromName(slugify(i)));
  const paginatedNodes = pages.map((pageNodes, i) => ({
    // props used for render
    props: {
      //  all the nodes on this page
      nodes: pageNodes,
      // the current page number, 0-indexed
      pageNumber: i,
      // the total number of pages
      numPages: pages.length,
      // the list of all page slugs
      // to be used for linking to other pages
      pageSlugs,
    },
    // the current page's slug
    slug: pageSlugs[i],
    // the component to render the page
    component,
  }));

  return paginatedNodes;
};

/**
 * a sort function to sort by date
 * @param {NodeMetaEntry} a
 * @param {NodeMetaEntry} b
 * @returns {-1|1} the sort order
 */
export const sortByNodeDate = (a, b) => {
  const dateA = a?.metadata?.date || '';
  const dateB = b?.metadata?.date || '';
  // newest first
  return dateA > dateB ? -1 : 1;
};

/**
 * Creates a function to filter the nodes by their public path
 * @param {string} dir the path to filter by
 * @returns {(Array)=>Array<NodeMetaEntry>}
 */
export const filterByNodePath = (dir) => (node) => node?.publicPath?.startsWith?.(dir);
