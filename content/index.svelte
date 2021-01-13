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
  <section slot="beforeContent">
    <h1>Hello {name}!</h1>
    <h2>Welcome to the demosite for <a href="https://github.com/cborchert/5sg">CODENAME 5SG</a>.</h2>
    <p>
      This site took 20 seconds to build, for 1000 interlinked blog pages, about 220 dynamically generated category,
      blog, and tags pages, and the conversion of 100 high quality (but too large) images to correctly sized files.
    </p>
    <p>Take some time to explore, we'll see you again soon.</p>
  </section>
  <section slot="afterContent">
    <p>Just to prove we can, let's list out all {nodeData.length} pages!</p>
    <ul>
      {#each Object.entries(nodeData) as [path, node]}
        <li>
          <article>
            <a href={path}>{(node.seo && node.seo.title) || path}</a>
            <p>{(node.seo && node.seo.description) || 'no discription available'}</p>
          </article>
        </li>
      {/each}
    </ul>
  </section>
</Page>
