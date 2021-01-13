<script>
  import Page from '../components/Page.svelte';
  import Meta from '../components/Meta.svelte';

  export let siteMetadata = {};
  export let data = {};

  const { nodes, term, taxonomy: tags, taxonomyHome: tagsHome } = data;
  const meta = {
    siteMetadata,
    title: `Tag: ${term}`,
    description: `All the blog posts with the tag of ${term} `,
  };
</script>

<Meta {...meta} />
<Page>
  <h1>Tag: {term}</h1>
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
