<script>
  import Page from '../components/Page.svelte';
  export let data = {};
  const { nodes, name, taxonomy: tags, taxonomyHome: tagsHome } = data;
</script>

<Page>
  <h1>Tag: {name}</h1>
  <h2>Posts</h2>
  <ul>
    {#each nodes as { path, seo }}
      <li>
        <article>
          <a href={path}>{(seo && seo.title) || path}</a>
          <p>{(seo && seo.description) || 'no discription available'}</p>
        </article>
      </li>
    {/each}
  </ul>

  <h2>Check out another tag:</h2>
  <ul>
    <li><a href={tagsHome}>All tags</a></li>
    {#each Object.entries(tags) as [tagName, { path, nodes: tagPosts }]}
      <li><a href={path}>{tagName} ({tagPosts.length} post{tagPosts.length === 1 ? '' : 's'})</a></li>
    {/each}
  </ul>
</Page>
