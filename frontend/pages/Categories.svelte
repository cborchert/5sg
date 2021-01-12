<script>
  import Page from '../components/Page.svelte';
  export let data = {};
  const { taxonomy: categories } = data;
</script>

<Page>
  <h1>Categories:</h1>
  <ul>
    {#each Object.entries(categories) as [categoryName, { path, nodes: categoryPosts }]}
      <li><a href={path}>{categoryName} ({categoryPosts.length} post{categoryPosts.length === 1 ? '' : 's'})</a></li>
    {/each}
  </ul>
</Page>
