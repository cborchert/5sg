<script>
  import Page from '../components/Page.svelte';
  export let data = {};
  const { numPages, pageNumber, nodes, pagination } = data;
</script>

<Page>
  <h1>Blog page {pageNumber} of {numPages}</h1>
  <h2>Posts</h2>
  <ul>
    {#each nodes as { path, seo }}
      <li>
        <a href={path}>{(seo && seo.title) || path}</a>
        <p>{(seo && seo.description) || 'no discription available'}</p>
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
