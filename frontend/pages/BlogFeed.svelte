<script>
  import Page from '../components/Page.svelte';
  export let data = {};
  const { numPages, pageNumber, posts, pagination } = data;
</script>

<Page>
  <h1>Blog page {pageNumber} of {numPages}</h1>
  <h2>Posts</h2>
  {#each posts as { path, seo }}
    <li>
      <a href={path}>{(seo && seo.title) || path}</a>
      <p>{(seo && seo.description) || 'no discription available'}</p>
    </li>
  {/each}

  <h2>Pagination</h2>
  {#each pagination as path, i}
    <li><a href={path}>Page {i + 1}</a></li>
  {/each}
</Page>
