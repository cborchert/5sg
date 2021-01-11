<script>
  import Page from '../frontend/components/Page.svelte';
  export const name = 'world';
  export let nodeData = {};
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Home page" />
</svelte:head>

<Page>
  <div slot="beforeContent">
    <h1>Hello {name}!</h1>
  </div>
  <div slot="afterContent">
    <p>Let's list out all the pages!</p>
    <ul>
      {#each Object.entries(nodeData) as [path, node]}
        <li>
          <a href={path}>{(node.seo && node.seo.title) || path}</a>
          <p>{(node.seo && node.seo.description) || 'no discription available'}</p>
        </li>
      {/each}
    </ul>
  </div>
</Page>
