// @ts-check

require('./typedefs.js');

/**  @todo while we don't want to bog people down with complexity, it would be nice to have a way to reinforce the `node` type */

/**
 * @callback slugifyPageNumber
 * @param {number} pageNumber page number
 * @returns {string} the slug
 */

/**
 * Dynamically creates nodes for paginated lists of nodes
 *
 * Injects the following props into the given component
 * - nodes: all the nodes on the current page
 * - pageNumber: starting at 1
 * - numPages: the number of pages
 * - pagination: an array of lists to each page in the pagination
 *
 * @param {Object} param0 the prob
 * @param {Object[]} param0.nodes the content nodes
 * @param {slugifyPageNumber} param0.slugify transforms the page number into a slug without extension, e.g. slugify(1) === blog/page-1
 * @param {*} param0.Component the component to render
 * @param {number} param0.perPage how many nodes per page
 * @returns {Object[]} an array of dynamically created nodes
 */
const paginateNodes = ({ nodes, perPage = 10, slugify, Component }) => {
  const chunks = nodes.map((node, i) => (i % perPage === 0 ? nodes.slice(i, i + perPage) : null)).filter((a) => a);

  // create a linking mechanism
  // so that <a href="blog-page-1.dynamic">Page 1</a> will be replaced with the link to the final html
  const pagination = chunks.map((pageNodes, i) => `${slugify(i)}.dynamic`);
  const paginatedNodes = chunks.map((pageNodes, i) => ({
    data: {
      // props used for render
      /** @todo  -- use dynamicPath attribute as a replacement for initial and relPath */
      initialPath: `${slugify(i)}.dynamic`, // useful for reporting
      relPath: `${slugify(i)}.dynamic`, // useful for reporting and linking
      finalPath: `${slugify(i)}.html`,
      // props used in component
      nodes: pageNodes,
      pageNumber: i + 1,
      numPages: chunks.length,
      pagination,
    },
    // the rendering component
    Component,
  }));

  return paginatedNodes;
};

/**
 * @callback slugifyTermName
 * @param {string} termName the term name
 * @returns {string} the slug
 */

/**
 * @callback getNodeTerms
 * @param {Object} node the node
 * @returns {string[]} the terms
 */

/**
 * Dynamically creates nodes for taxonomy pages and their terms
 *
 * NOTE: a taxonomy is what we're calling a group of node classification, and a term is a single node classification in that group.
 * For example, imagine that every page has a category
 * e.g. nodes = [{category: "foo", content: "Lorem"}, {category: "bar", content: "Ipsum"}, {category: "foo", content: "Dolor"}]
 *   The taxonomy is "category", and the terms are "foo" and "bar"
 *   It could be represented as
 *   categories = {"foo": {nodes: [p1, p3]}, "bar": {nodes: [p2]}}
 *
 * Or, for example, imagine that every page has several tags
 * e.g. nodes = [{tags: ["foo"], content: "Lorem"}, {tags: ["foo", "bar"], content: "Ipsum"}, {tags: ["bar"], content: "Dolor"}]
 *   The taxonomy is "tag", and the terms are "foo" and "bar"
 *   It could be represented as
 *   tags = {"foo": {nodes: [p1, p2]}, "bar": {nodes: [p2, p3]}}
 *
 * Creates a page for every term, injecting the following props into the Component
 * - nodes: all the nodes for the current term in the taxonomy
 * - taxonomy: the entire taxonomy {[string]: { path: string, nodes: Array<node>}}, e.g. for tags: {"foo": {nodes: [p1, p2], path: 'slug-of/foo.dynamic'}, "bar": {nodes: [p2, p3], path: 'slug-of/bar.dynamic'}}
 * - term: the name of the term, e.g. "foo"
 * - taxonomyHome: the slug to the taxonomy
 *
 * Creates a single page for the taxonomy, injecting the following props into the TaxonomyComponent
 * - taxonomy: the entire taxonomy {[string]: { path: string, nodes: Array<node>}}, e.g. for tags: {"foo": {nodes: [p1, p2], path: 'slug-of/foo.dynamic'}, "bar": {nodes: [p2, p3], path: 'slug-of/bar.dynamic'}}
 *
 * @param {Object} param0 the props
 * @param {Object[]} param0.nodes the nodes
 * @param {getNodeTerms} param0.getNodeTerms given a node, return the desired terms as an array, e.g. for categories getNodeTerms = (node)=>[node.data.frontmatter.category]
 * @param {slugifyTermName} param0.slugify transforms the page number into a slug without extension, e.g. slugify("my category") === blog/category/my-category
 * @param {string} param0.taxonomySlug the slug for the taxonomy, e.g. "blog/categories"
 * @param {*} param0.Component the component to render a single term
 * @param {*} param0.TaxonomyComponent the component to render the taxonomy home
 * @returns {Object[]} the array of created nodescreated
 */
const createTaxonomyPages = ({ nodes, slugify, taxonomySlug, getNodeTerms, Component, TaxonomyComponent }) => {
  // Get a map of terms in taxonomy
  // e.g.
  // {
  //   test: { path: taxonomy-page-test.dynamic, nodes: [p1, p2, p3, p4],},
  //   foo: { path: taxonomy-page-foo.dynamic, nodes: [p5, p6],},
  //   uncategorized: { path: taxonomy-page-uncategorized.dynamic, nodes: [p7, p8, p9],},
  // }
  /** @todo use lodash?? */
  const terms = nodes.reduce((prevTerms, node) => {
    const nodeTerms = getNodeTerms(node);
    nodeTerms.forEach((termName = '') => {
      if (!prevTerms[termName]) {
        // eslint-disable-next-line no-param-reassign
        prevTerms[termName] = { path: `${slugify(termName)}.dynamic`, nodes: [] };
      }
      prevTerms[termName].nodes.push(node);
    });
    return prevTerms;
  }, {});

  // create individual pages for each term
  const termPageNodes = Object.entries(terms).map(([termName, { path, nodes: termNodes }]) => ({
    data: {
      // props used for render
      /** @todo  -- use dynamicPath attribute as a replacement for initial and relPath */
      // note that the path already has a `.dynamic`
      initialPath: path, // useful for reporting
      relPath: path, // useful for reporting and linking
      finalPath: path.replace(/\.dynamic$/, '.html'),
      // props used in component
      nodes: termNodes,
      taxonomy: terms,
      term: termName,
      taxonomyHome: `${taxonomySlug}.dynamic`,
    },
    // the rendering component
    Component,
  }));

  // create term home
  const taxonomyNode = TaxonomyComponent
    ? {
        data: {
          // props used for render
          /** @todo  -- use dynamicPath attribute as a replacement for initial and relPath */
          initialPath: `${taxonomySlug}.dynamic`, // useful for reporting
          relPath: `${taxonomySlug}.dynamic`, // useful for reporting and linking
          finalPath: `${taxonomySlug}.html`,
          // props used in component
          taxonomy: terms,
        },
        // the rendering component
        Component: TaxonomyComponent,
      }
    : null;

  return taxonomyNode ? [taxonomyNode, ...termPageNodes] : termPageNodes;
};

module.exports = {
  createTaxonomyPages,
  paginateNodes,
};
