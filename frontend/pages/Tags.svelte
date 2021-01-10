<script>
  import Page from '../components/Page.svelte';
  export let data = {};
  const { tags } = data;
</script>

<Page>
  <h1>Tags:</h1>
  <ul>
    {#each Object.entries(tags) as [tagName, { path, posts: tagPosts }]}
      <li><a href={path}>{tagName} ({tagPosts.length} post{tagPosts.length === 1 ? '' : 's'})</a></li>
    {/each}
  </ul>
</Page>
