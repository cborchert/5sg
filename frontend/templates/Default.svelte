<script>
  import Globals from '../components/Globals.svelte';
  import Header from '../components/Header.svelte';

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

<body>
  <Header />
  <main>
    <slot name="beforeContent" />
    {@html htmlContent}
    <slot name="afterContent" />
  </main>
  <Globals />
</body>
