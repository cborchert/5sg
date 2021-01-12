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
};
