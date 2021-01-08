<script>
  import Page from '../components/Page.svelte';

  export let htmlContent = '';
  export let data = {};
  const frontmatter = data.frontmatter || {};
  const { title: metaTitle, description: metaDescription } = data.seo || {};
  const { title, date, author } = frontmatter;
  const attribution = `${date ? `Written on ${new Date(date).toDateString()} ` : ''} ${
    author ? `by ${author} ` : ''
  }`.trim();
</script>

<svelte:head>
  <title>{metaTitle || ''}</title>
  <meta name="description" content={metaDescription} />
</svelte:head>

<Page>
  <h1>{title}</h1>
  <h3>{attribution}</h3>
  <div>
    {@html htmlContent}
  </div>
</Page>
