<script>
  import Page from '../components/Page.svelte';
  export let data = {};
  const { posts, name, tags, tagsHome } = data;
</script>

<Page>
  <h1>Tag: {name}</h1>
  <h2>Posts</h2>
  <ul>
    {#each posts as { path, seo }}
      <li>
        <a href={path}>{(seo && seo.title) || path}</a>
        <p>{(seo && seo.description) || 'no discription available'}</p>
      </li>
    {/each}
  </ul>

  <h2>Check out another tag:</h2>
  <ul>
    <li><a href={tagsHome}>All tags</a></li>
    {#each Object.entries(tags) as [tagName, { path, posts: tagPosts }]}
      <li><a href={path}>{tagName} ({tagPosts.length} post{tagPosts.length === 1 ? '' : 's'})</a></li>
    {/each}
  </ul>
</Page>
