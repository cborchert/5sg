<script context="module">
  /**
   * Derives additional props from the node data
   *
   * @param {Object} param0
   * @param {Object} param0.nodeData the data relative to all nodes
   * @param {Object} param0.data the data relative to this content
   * @returns {Object} the additional props
   */
  export const __5sg__deriveProps = ({ nodeData = {}, data = {} }) => {
    // create sibling pages
    const blogPages = Object.values(nodeData)
      .filter((node) => node.relPath.startsWith('blog/'))
      .sort((a, b) => {
        const dateA = (a.frontmatter && a.frontmatter.date) || '';
        const dateB = (b.frontmatter && b.frontmatter.date) || '';
        // newest first
        return dateA > dateB ? -1 : 1;
      });
    const currentIndex = blogPages.findIndex((node) => node.relPath === data.relPath);
    const prevPost = currentIndex > 0 && blogPages[currentIndex - 1];
    const nextPost = currentIndex < blogPages.length - 1 && blogPages[currentIndex + 1];

    // these will be injected into the component
    return {
      nextPost,
      prevPost,
    };
  };
</script>

<script>
  import Page from '../components/Page.svelte';
  import { getCategoryNames, getCategorySlug, getTagNames, getTagSlug } from '../../shared/blogHelpers';

  // the rendered content from the source
  export let htmlContent = '';
  // the data relative to this content
  export let data = {};
  export let siteMetadata = {};

  // these props are injected thanks to __5sg__deriveProps above
  export let nextPost;
  export let prevPost;

  // extract frontmatter for seo and page header/attrution
  const frontmatter = data.frontmatter || {};
  const { title, description, date, author, cover } = frontmatter;
  const meta = { siteMetadata, title, description };
  const attribution = `${date ? `Written on ${new Date(date).toDateString()} ` : ''} ${
    author ? `by ${author} ` : ''
  }`.trim();

  // additional metadata
  const categories = getCategoryNames(data);
  const tags = getTagNames(data);
</script>

<Page {meta}>
  <div slot="beforeMain">
    {#if cover}
      <img class="cover" src={cover} alt={title} />
    {/if}
  </div>
  <article>
    <header>
      {#if title}
        <h1>{title}</h1>
      {/if}
      {#if attribution}
        <h3>{attribution}</h3>
      {/if}

      {#if categories && categories.length > 0}
        <div class="meta-attribute">
          <h4 class="meta-attribute__title">Categories:</h4>
          <ul class="meta-attribute__value">
            {#each categories as category}
              <li><a href={`${getCategorySlug(category)}.dynamic`}>{category}</a></li>
            {/each}
          </ul>
        </div>
      {/if}
      {#if tags && tags.length > 0}
        <div class="meta-attribute">
          <h4 class="meta-attribute__title">Tags:</h4>
          <ul class="meta-attribute__value">
            {#each tags as tag}
              <li class="tag"><a href={`${getTagSlug(tag)}.dynamic`}>#{tag}</a></li>
            {/each}
          </ul>
        </div>
      {/if}
    </header>
    <div>
      {@html htmlContent}
    </div>
    <footer>
      <nav>
        <ul class="sibling-navigation">
          <li>
            {#if prevPost}<a href={prevPost.relPath}>← {prevPost.frontmatter.title}</a>{/if}
          </li>
          <li>
            {#if nextPost}<a href={nextPost.relPath}>{nextPost.frontmatter.title} →</a>{/if}
          </li>
        </ul>
      </nav>
    </footer>
  </article>
</Page>

<style>
  .cover {
    width: 100%;
    height: 400px;
    margin: 0 auto;
    object-fit: cover;
  }

  .sibling-navigation {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
  }
  .sibling-navigation li {
    list-style: none;
    flex-grow: 1;
    padding: 12px 0;
  }

  header {
    margin-bottom: 64px;
  }

  header h1 {
    font-size: 3rem;
  }
  header h3,
  header {
    font-size: 0.9rem;
  }

  .meta-attribute {
    display: flex;
    justify-content: flex-start;
    margin: 4px 0;
  }

  .meta-attribute__title {
    flex: 0;
    margin: 0;
    padding: 4px 0 0;
  }

  .meta-attribute__value {
    flex: 1;
    margin: 0;
    padding: 0 0 0 8px;
  }

  .meta-attribute__value li {
    display: inline-block;
    padding: 0 0 0 8px;
  }

  li.tag {
    background: var(--bg-secondary);
    padding: 0px 8px;
    margin: 2px 4px;
  }

  footer {
    margin-top: 32px;
  }

  @media screen and (min-width: 600px) {
    .sibling-navigation {
      flex-direction: row;
    }
    .sibling-navigation li:last-child {
      text-align: right;
    }
  }
</style>
