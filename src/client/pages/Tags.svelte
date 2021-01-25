<script>
  import Page from '../components/Page.svelte';

  export let data = {};
  export let siteMetadata = {};

  const meta = { siteMetadata, title: 'Tags', description: 'All the tags on the example site' };
  const { taxonomy: tags } = data;
</script>

<Page {meta}>
  <h1>Tags:</h1>
  <ul>
    {#each Object.entries(tags) as [tagName, { path, nodes: tagPosts }]}
      <li><a href={path}>{tagName} ({tagPosts.length} post{tagPosts.length === 1 ? '' : 's'})</a></li>
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
