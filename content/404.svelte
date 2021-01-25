<script>
  import Page from '../src/client/components/Page.svelte';
  export let siteMetadata = {};
  const meta = { title: '404', description: 'Lost page', siteMetadata };
</script>

<Page {meta}>
  <section>
    <div>
      <h1>Woah man. <mark>404</mark>.</h1>
      <h2>Don't worry. It happens to the best of us.</h2>
    </div>
  </section>
</Page>

<style>
  section {
    height: 80vh;
    display: grid;
    justify-content: center;
    align-items: center;
  }
  h1 {
    line-height: 1;
    margin-bottom: 16px;
  }
  mark {
    color: var(--tertiary);
    background: var(--bg);
  }
</style>
