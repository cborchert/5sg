<script>
  export let node = {};
  const { frontmatter = {}, path } = node;
  const { date, author, cover, title = '', description = '' } = frontmatter;
  const attribution = `${date ? `Written on ${new Date(date).toDateString()} ` : ''} ${
    author ? `by ${author} ` : ''
  }`.trim();
  const colors = ['#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#f1c40f', '#e67e22', '#e74c3c'];
</script>

<article>
  <a class="cover-container" href={path}>
    {#if cover}
      <img class="cover" src={cover} alt={title} />
    {:else}
      <div class="cover" style={`background: ${colors[Math.floor(Math.random() * colors.length)]}`} />
    {/if}
  </a>
  <section>
    <h2><a href={path}>{title || path}</a></h2>
    {#if attribution}
      <h5>{attribution}</h5>
    {/if}
    {#if description}
      <p>{description}</p>
    {/if}
  </section>
</article>

<style>
  article {
    background: var(--bg-tertiary);
    display: flex;
    flex-direction: column;
    margin: 32px 0;
    box-shadow: 2px 2px 4px var(--shadow-secondary);
  }
  .cover-container {
    display: block;
    width: 100%;
    height: 300px;
    margin: 0;
    padding: 0;
  }

  .cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  section {
    padding: 12px 24px;
  }

  @media screen and (min-width: 600px) {
    .cover-container {
      width: 200px;
      height: 200px;
    }

    article {
      flex-direction: row;
    }
  }
</style>
