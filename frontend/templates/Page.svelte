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
</svelte:head>

<main>
  <slot />
  {@html htmlContent}
</main>
