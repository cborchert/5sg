<script>
  import Page from '../components/Page.svelte';
  import Meta from '../components/Meta.svelte';

  export let data = {};
  export let siteMetadata = {};

  const { taxonomy: categories } = data;
  const meta = { siteMetadata, title: 'Categories', description: 'All the categories on the example site' };
</script>

<Meta {...meta} />
<Page>
  <h1>Categories:</h1>
  <ul>
    {#each Object.entries(categories) as [categoryName, { path, nodes: categoryPosts }]}
      <li><a href={path}>{categoryName} ({categoryPosts.length} post{categoryPosts.length === 1 ? '' : 's'})</a></li>
    {/each}
  </ul>
</Page>

<style>
  li {
    list-style: none;
  }
  ul {
    padding: 0;
  }
</style>
