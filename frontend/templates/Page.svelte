<script>
  export let htmlContent = '';
  export let data = {};
  const frontmatter = data.frontmatter || {};
  const { title: metaTitle, description: metaDescription } = data.seo || {};
</script>

<style>
  main {
    max-width: 1024px;
    margin: 0 auto;
    padding: 32px 16px 64px;
  }
</style>

<svelte:head>
  <title>{metaTitle || ''}</title>
  <meta name="description" content={metaDescription} />
  <link rel="stylesheet" href="/static/styles/normalize.css" />
  <link rel="stylesheet" href="/static/styles/global.css" />
  <script src="https://cdn.jsdelivr.net/npm/turbolinks@5.2.0/dist/turbolinks.min.js">
  </script>
</svelte:head>

<body>
  <main>
    <slot />
    {@html htmlContent}
  </main>
  <script src="/static/scripts/global.js">
  </script>
</body>
