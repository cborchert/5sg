<script>
  import Page from '../components/Page.svelte';
  import {
    getCategoryNames,
    getCategorySlug,
    getTagNames,
    getTagSlug,
    tagHome,
    categoryHome,
  } from '../../config/blogHelpers';

  export let htmlContent = '';
  export let data = {};
  export let siteMetadata = {};
  const { name: siteTitle = '' } = siteMetadata;

  const frontmatter = data.frontmatter || {};
  const { title: metaTitle, description: metaDescription } = data.seo || {};
  const { title, date, author } = frontmatter;
  const attribution = `${date ? `Written on ${new Date(date).toDateString()} ` : ''} ${
    author ? `by ${author} ` : ''
  }`.trim();

  const categories = getCategoryNames(data);
  const tags = getTagNames(data);
</script>

<svelte:head>
  <title>{metaTitle || ''} -- {siteTitle}</title>
  <meta name="description" content={metaDescription} />
</svelte:head>

<Page>
  <header>
    {#if title}
      <h1>{title}</h1>
    {/if}
    {#if attribution}
      <h3>{attribution}</h3>
    {/if}
    <h4>Categories:</h4>
    {#if categories && categories.length > 0}
      <ul>
        {#each categories as category}
          <li><a href={`${getCategorySlug(category)}.dynamic`}>{category}</a></li>
        {/each}
      </ul>
    {/if}
    {#if tags && tags.length > 0}
      <h4>Tags:</h4>
      <ul>
        {#each tags as tag}
          <li><a href={`${getTagSlug(tag)}.dynamic`}>#{tag}</a></li>
        {/each}
      </ul>
    {/if}
  </header>
  <div>
    {@html htmlContent}
  </div>
</Page>
