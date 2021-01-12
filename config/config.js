// OPTIONAL plugins, which will increase build time
const gfm = require('remark-gfm');
const gemoji = require('remark-gemoji');
const footnotes = require('remark-footnotes');
const highlight = require('remark-highlight.js');
const minifyHtml = require('rehype-preset-minify');

const createDynamicPages = require('./createDynamicPages.js');

module.exports = {
  // siteMetadata is injected into every template as the prop siteMetadata
  // it is also used for generating the sitemap and manifest
  siteMetadata: {
    // used for sitemap
    siteUrl: `https://www.example.com`,
    // used for manifest
    name: 'Stupid simple static site generator',
    short_name: '5sg',
    description: 'A ssg that is made for making simple sites simple',
    icons: [
      { src: '/static/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/static/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  },
  generateSitemap: true,
  generateManifest: true,
  // if defined, this must be a function returning an array of nodes
  createDynamicPages,
  // config for processing MD files to create HTML
  processing: {
    // Additional plugins for processing content files.
    // These will usually be remark plugins, i.e. `remark-whatever`
    // see
    //
    // NOTE: you can really get carried away here and accidentally make your build time skyrocket.
    //   use plugins sparingly
    //
    // Each plugin should have a use prop which defines the plugin to use,
    // and a priority prop which defines the order of execution;
    // the higher the priority the earlier it's executed
    // Standard plugins have the following priority
    //   priority 100 && 99 => extracting frontmatter to data prop
    //   priority 50 => other transformations
    //   priority -100 => transform to html
    plugins: [
      { use: gfm, priority: 25 },
      { use: gemoji, priority: 25 },
      { use: footnotes, priority: 25 },
      { use: highlight, priority: 25 },
    ],
  },
  // config for converting semi-final HTML content to final, published HTML content
  postProcessing: {
    // Additional plugins for post processing content HTML
    // These will usually be non-remark plugins
    // see: https://github.com/rehypejs/rehype/blob/main/doc/plugins.md or
    //
    // NOTE: you can really get carried away here and accidentally make your build time skyrocket.
    //   use plugins sparingly
    //
    // Each plugin should have a use prop which defines the plugin to use,
    // and a priority prop which defines the order of execution;
    // the higher the priority the earlier it's executed
    // Standard plugins have the following priority
    //   priority 100 => turning HTML to AST
    //   priority 50 => other transformations
    //   priority 0 => transform to html
    // So, if you want to work on the AST, use priority 1 - 99
    // If you want to work on the HTML, use priority > 100 or < 0
    plugins: [
      // NOTE: this is here for demo purposes, but it actually adds
      { use: minifyHtml, priority: -100 },
    ],
  },
};
