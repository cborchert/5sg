<script>
  import Page from '../components/Page.svelte';

  export let data = {};
  export let siteMetadata = {};

  const { taxonomy: categories } = data;
  const meta = { title: 'Categories', description: 'All the categories on the example site', siteMetadata };
</script>

<Page {meta}>
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
