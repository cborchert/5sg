<script>
  import Default from './Default.svelte';

  export let htmlContent = '';
  export let data = {};
  export let nodeData = {};
</script>

<Default {data} {htmlContent}>
  <div slot="beforeContent">
    <h1>What a special page!</h1>
  </div>
  <div slot="afterContent">
    <p>Let's list out all the pages!</p>
    <ul>
      {#each Object.entries(nodeData) as [path, node]}
        <li>
          <a href={path}>{node.seo.title}</a>
          <p>{node.seo.description}</p>
        </li>
      {/each}
    </ul>
  </div>
</Default>
