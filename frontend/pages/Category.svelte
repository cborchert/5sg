<script>
  import Page from '../components/Page.svelte';
  export let data = {};
  const { posts, name, categories, categoryHome } = data;
</script>

<Page>
  <h1>Category: {name}</h1>
  <h2>Posts</h2>
  <ul>
    {#each posts as { path, seo }}
      <li>
        <a href={path}>{(seo && seo.title) || path}</a>
        <p>{(seo && seo.description) || 'no discription available'}</p>
      </li>
    {/each}
  </ul>

  <h2>Check out another category:</h2>
  <ul>
    <li><a href={categoryHome}>All categories</a></li>
    {#each Object.entries(categories) as [categoryName, { path, posts: categoryPosts }]}
      <li><a href={path}>{categoryName} ({categoryPosts.length} post{categoryPosts.length === 1 ? '' : 's'})</a></li>
    {/each}
  </ul>
</Page>
