<script>
  import Page from '../components/Page.svelte';
  import ArticlePreview from '../components/ArticlePreview.svelte';

  export let data = {};
  export let siteMetadata = {};
  const { numPages, pageNumber, nodes, pagination } = data;
  const meta = {
    siteMetadata,
    title: `Blog feed, page ${pageNumber}`,
    description: 'All the blog posts on the example site',
  };
</script>

<Page {meta}>
  <h1>Blog page {pageNumber} of {numPages}</h1>
  <ul>
    <li><a href="/blog/categories/">See all post categories</a></li>
    <li><a href="/blog/tags/">See all post tags</a></li>
  </ul>
  <h2>Posts</h2>
  <ul>
    {#each nodes as node}
      <li>
        <ArticlePreview {node} />
      </li>
    {/each}
  </ul>

  {#if pagination.length > 1}
    <h2>Pagination</h2>
    <ul>
      {#each pagination as path, i}
        <li class="pagination-page">
          {#if i + 1 === pageNumber}
            {i + 1}
          {:else}
            <a href={path}>{i + 1}</a>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</Page>

<style>
  li {
    list-style: none;
  }
  ul {
    padding: 0;
  }

  .pagination-page {
    display: inline-block;
    padding: 0 4px;
  }
</style>
