<script context="module">
  /**
   * Derives additional props from the node data
   *
   * @param {Object} param0
   * @param {Object} param0.nodeData the data relative to all nodes
   * @param {Object} param0.data the data relative to this content
   * @returns {Object} the additional props
   */
  export const __5sg__deriveProps = ({ nodeData }) => ({
    // this will be injected into the component
    pages: Object.entries(nodeData).map(([path, node = {}]) => {
      const { frontmatter: { title, description } = {} } = node;
      return {
        path,
        title,
        description,
      };
    }),
  });

  // export const __5sg__hydrate = true;
</script>

<script>
  import Page from '../components/Page.svelte';

  export let htmlContent = '';
  export let data = {};
  export let siteMetadata = {};

  const { frontmatter: { title, description } = {} } = data;
  const meta = { title, description, siteMetadata };
  let count = 0;
  const increment = () => count++;
  const fizzBuzz = (number) => {
    let fb = '';
    if (number % 3 === 0) fb += 'fizz';
    if (number % 5 === 0) fb += 'buzz';
    return fb || number;
  };

  // injected from __5sg__deriveProps, above
  export let pages = [];
</script>

<Page {meta}>
  <div slot="beforeContent">
    <h1>What a special page!</h1>
    <button on:click={increment}>{fizzBuzz(count)}</button>
  </div>
  <div>
    {@html htmlContent}
  </div>
  <div slot="afterContent">
    <p>Let's list out all the pages!</p>
    <ul>
      {#each pages as { path, title, description }}
        <li>
          <a href={path}>{title || path}</a>
          <p>{description || 'no description'}</p>
        </li>
      {/each}
    </ul>
  </div>
</Page>
