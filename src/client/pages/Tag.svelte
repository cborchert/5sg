<script>
  import Page from '../components/Page.svelte';
  import ArticlePreview from '../components/ArticlePreview.svelte';

  export let data = {};
  export let siteMetadata = {};

  const { nodes, term, taxonomy: tags, taxonomyHome: tagsHome } = data;
  const meta = {
    siteMetadata,
    title: `Tag: ${term}`,
    description: `All the blog posts with the tag of ${term} `,
  };
</script>

<Page {meta}>
  <h1>Tag: {term}</h1>
  <h2>Posts</h2>
  <ul>
    {#each nodes as node}
      <li>
        <ArticlePreview {node} />
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

<style>
  li {
    list-style: none;
  }
  ul {
    padding: 0;
  }
</style>
