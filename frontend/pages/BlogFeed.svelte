<script>
  import Page from '../components/Page.svelte';
  import Meta from '../components/Meta.svelte';
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

<Meta {...meta} />
<Page>
  <h1>Blog page {pageNumber} of {numPages}</h1>
  <h2>Posts</h2>
  <ul>
    {#each nodes as node}
      <li>
        <ArticlePreview {node} />
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

<style>
  li {
    list-style: none;
  }
</style>
