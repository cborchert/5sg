import gemoji from 'remark-gemoji';
import footnotes from 'remark-footnotes';
import highlight from 'remark-highlight.js';
import gfm from 'remark-gfm';

export default {
  // where is the root of the site ? this is the path to the site from the root of the domain
  // default is '/'
  serverRoot: '/',
  // the site url (note: siteUrl + serverUrl = homepage)
  // used for building the sitemeta
  siteUrl: 'http://example.com',
  // what should the layouts be? _ is default.
  // default is undefined
  layouts: { blog: `src/layouts/Blog.svelte`, _: `src/layouts/Page.svelte` },
  // what remark plugins to use?
  // default is [highlight, gfm, gemoji]
  remarkPlugins: [highlight, gfm, gemoji, footnotes],
  // Given the nodeMeta, returns the information necessary to render some dynamic pages
  getDynamicNodes: () => [],
  // the site meta passed in as props to each layout as siteMeta
  siteMeta: {
    name: '5sg',
  },
  // ADVANCED USAGE
  // what preprocessors should we apply to the svelte and markdown files ?
  // if this is defined, it will override the default 5sg preprocessors
  preprocessors: [],
};
