<script>
  import Page from '../components/Page.svelte';
  import Meta from '../components/Meta.svelte';

  export let siteMetadata = {};
  export let data = {};

  const meta = { siteMetadata, title: 'Tags', description: 'All the tags on the example site' };
  const { taxonomy: tags } = data;
</script>

<Meta {...meta} />
<Page>
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
