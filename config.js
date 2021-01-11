module.exports = {
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
};
