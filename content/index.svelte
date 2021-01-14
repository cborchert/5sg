<script>
  import Page from '../frontend/components/Page.svelte';
  export const name = 'world';
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Home page" />
</svelte:head>

<Page>
  <div slot="beforeContent">
    <section>
      <div>
        <div class="intro">
          <h1>Hello, {name}!</h1>
          <h5>Welcome to the demosite for <a href="https://github.com/cborchert/5sg">CODENAME 5SG</a>.</h5>
        </div>
        <p>
          This site took 20 seconds to build, for 1000 interlinked blog pages, about 220 dynamically generated category,
          blog, and tags pages, and the conversion of 100 high quality (but too large) images to correctly sized files.
        </p>
        <p>Take some time to explore, we'll see you again soon.</p>
      </div>
    </section>
  </div>
</Page>

<style>
  section {
    height: 80vh;
    display: grid;
    justify-content: center;
    align-items: center;
  }
  .intro {
    font-size: 2.5rem;
    margin-bottom: 64px;
  }
  h1 {
    line-height: 1;
    margin-bottom: 16px;
  }
</style>
