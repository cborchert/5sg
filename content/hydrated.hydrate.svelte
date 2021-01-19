<script>
  import Page from '../src/client/components/Page.svelte';
  export const name = 'hydration';
  let count = 0;
  const increment = () => count++;
</script>

<svelte:head>
  <title>Hydrated</title>
  <meta name="description" content="An example of a hydrated page" />
</svelte:head>

<Page>
  <div slot="beforeContent">
    <section>
      <div>
        <div class="intro">
          <h1>Hello, {name}!</h1>
          <h5><mark>Let's Count: {count}</mark></h5>
          <div>
            <button on:click={increment}>Increment</button>
          </div>
        </div>
        <p class="explanation">
          The html for this page was generated using a svelte component, and then <strong>hydrated</strong> on the
          client using the same svelte component. Since interactivity requires the client to download additional
          javascript,
          <strong>5sg</strong> doesn't do it on every page by default. It's up to the developer to mark the page for hydration.
        </p>
      </div>
    </section>
  </div>
</Page>

<style>
  section {
    min-height: 80vh;
    display: grid;
    justify-content: center;
    align-items: center;
  }
  .intro {
    font-size: 2rem;
    margin-bottom: 32px;
  }

  @media (min-width: 600px) {
    .intro {
      font-size: 2.5rem;
    }
  }

  button {
    font-size: 1rem;
  }
  h1 {
    line-height: 1;
    margin-bottom: 16px;
  }
  mark {
    background: transparent;
    color: var(--tertiary);
  }
  .explanation {
    font-style: italic;
  }
</style>
