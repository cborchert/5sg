<script>
  import Page from '../components/Page.svelte';
  import Meta from '../components/Meta.svelte';

  export let data = {};
  export let siteMetadata = {};

  const { nodes, term, taxonomy: categories, taxonomyHome: categoryHome } = data;
  const meta = {
    siteMetadata,
    title: `Category: ${term}`,
    description: `All the blog posts with the category of ${term} `,
  };
</script>

<Meta {...meta} />
<Page>
  <h1>Category: {term}</h1>
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

  <h2>Check out another category:</h2>
  <ul>
    <li><a href={categoryHome}>All categories</a></li>
    {#each Object.entries(categories) as [categoryName, { path, nodes: categoryPosts }]}
      <li><a href={path}>{categoryName} ({categoryPosts.length} post{categoryPosts.length === 1 ? '' : 's'})</a></li>
    {/each}
  </ul>
</Page>
