import '../../src/types/typedefs.js';

/**
 * Formats a name to a dynamic slug which can be universally recognized
 * @param {string} name the page name
 * @returns {string} the dynamic slug
 */
export const getDynamicSlugFromName = (name = '') => (name.endsWith('.dynamic') ? name : `${name}.dynamic`);

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
 * @returns {(NodeMetaEntry)=>boolean}
 */
export const filterByNodePath = (dir) => (node) => node?.publicPath?.startsWith?.(dir);

/**
 * Creates a function to filter the nodes by their frontmatter
 * Returns true if the given key equals the given value OR if the given key contains the given value (if an array)
 * @param {string} key the frontmatter entry key
 * @param {any} val the frontmatter entry value to test against
 * @returns {(NodeMetaEntry)=>boolean}
 */
export const filterByNodeFrontmatter =
  (key, val) =>
  (node = {}) => {
    const { metadata } = node;
    if (metadata && metadata.hasOwnProperty(key)) {
      return metadata[key] === val || (Array.isArray(metadata[key]) && metadata[key].includes(val));
    }
    return false;
  };

/**
 * Gathers all the existing values of a given frontmatter entry on a node collection
 * @example
 * const nodes = [
 *   {metadata: { foo: ["A", "b", "c"] } },
 *   {metadata: { foo: "d" } },
 *   {metadata: { foo: ["e", "C"] } },
 *   {metadata: { bar: ["lol"] } },
 * ]
 * // returns ["a", "b", "c", "d", "e"]
 * getFrontmatterTerms(nodes, 'foo', a => a.toLowerCase());
 *
 * @param {Array<NodeMetaEntry>} nodes the collection of nodes
 * @param {string} key the frontmatter entry key to collect the values of
 * @param {(any)=>any} transform the function to apply to each term (for example a=>a.toLowerCase())
 * @returns {Array}
 */
export const getFrontmatterTerms = (nodes = [], key, transform = (a) => a) => {
  // use a set to reduce redundancies
  const terms = new Set();
  nodes.forEach((node) => {
    const { metadata } = node;
    if (metadata.hasOwnProperty(key)) {
      if (Array.isArray(metadata[key])) {
        // if it's an array, add each transformed value
        metadata[key].forEach((val) => terms.add(transform(val)));
      } else {
        // otherwise, add the transformed value
        terms.add(transform(metadata[key]));
      }
    }
  });
  // back to an array
  return Array.from(terms);
};

/**
 * Groups a node collection by the values in a given frontmatter entry
 * @example
 * const node1 = {metadata: { foo: ["A", "b", "c"] } };
 * const node2 = {metadata: { foo: "d" } };
 * const node3 = {metadata: { foo: ["e", "C"] } };
 * const node4 = {metadata: { bar: ["lol"] } };
 * const nodes = [
 *   node1,
 *   node2,
 *   node3,
 *   node4,
 * ]
 * // returns
 * // {
 * //   "a": [node1],
 * //   "b": [node1],
 * //   "c": [node1, node3],
 * //   "d": [node2],
 * //   "e": [node3]
 * // }
 * groupByFrontmatterTerms(nodes, 'foo', a => a.toLowerCase());
 *
 * @param {Array<NodeMetaEntry>} nodes the collection of nodes
 * @param {string} key the frontmatter entry key to collect the values of
 * @param {(any)=>any} transform the function to apply to each term (for example a=>a.toLowerCase())
 * @returns {Object<string, Array<NodeMetaEntry>>} the grouped nodes
 */
export const groupByFrontmatterTerms = (nodes = [], key, transform = (a) => a) => {
  const nodesByTerm = {};

  /**
   * Adds the node to the entry, creating one if it doesn't exist
   */
  const addNodeToTermSet = (node, term) => {
    if (!nodesByTerm[term]) {
      // use sets to reduce redundancies
      nodesByTerm[term] = new Set();
    }
    nodesByTerm[term].add(node);
  };

  nodes.forEach((node) => {
    const { metadata } = node;
    if (metadata.hasOwnProperty(key)) {
      if (Array.isArray(metadata[key])) {
        // if an array, add the node to each tranformed term
        metadata[key].forEach((term) => {
          addNodeToTermSet(node, transform(term));
        });
      } else {
        // add the node to the transformed term
        addNodeToTermSet(node, transform(metadata[key]));
      }
    }
  });

  // transform the sets back to arrays
  return Object.fromEntries(
    Object.entries(nodesByTerm).map(([term, nodeSet]) => {
      return [term, Array.from(nodeSet)];
    }),
  );
};
