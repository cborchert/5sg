<script>
  import Page from '../components/Page.svelte';
  import Meta from '../components/Meta.svelte';
  export let data = {};
  export let siteMetadata = {};
  const { numPages, pageNumber, nodes, pagination } = data;
  const meta = {
    siteMetadata,
    title: `Blog feed, page ${pageNumber}`,
    description: 'All the blog posts on the example site',
  };
</script>

<Meta {...meta} />
<Page>
  <h1>Blog page {pageNumber} of {numPages}</h1>
  <h2>Posts</h2>
  <ul>
    {#each nodes as { path, seo }}
      <li>
        <article>
          <a href={path}>{(seo && seo.title) || path}</a>
          <p>{(seo && seo.description) || 'no discription available'}</p>
        </article>
      </li>
    {/each}
  </ul>

  <h2>Pagination</h2>
  <ul>
    {#each pagination as path, i}
      <li><a href={path}>Page {i + 1}</a></li>
    {/each}
  </ul>
</Page>
