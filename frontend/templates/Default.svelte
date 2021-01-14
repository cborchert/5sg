<script>
  import Page from '../components/Page.svelte';
  import Meta from '../components/Meta.svelte';
  import { getCategoryNames, getCategorySlug, getTagNames, getTagSlug } from '../../config/blogHelpers';

  // the rendered content from the source
  export let htmlContent = '';
  // the data relative to this content
  export let data = {};
  // the data relative to all nodes
  export let nodeData = {};

  export let siteMetadata = {};
  const meta = { siteMetadata, ...(data.seo || {}) };

  // extract frontmatter for seo and page header/attrution
  const frontmatter = data.frontmatter || {};
  const { title, date, author, cover } = frontmatter;
  const attribution = `${date ? `Written on ${new Date(date).toDateString()} ` : ''} ${
    author ? `by ${author} ` : ''
  }`.trim();

  // additional metadata
  const categories = getCategoryNames(data);
  const tags = getTagNames(data);

  // create sibling pages
  // TODO: This is expensive and repetitive to to each time.
  //   This should be generated during post processing.
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
</script>

<Meta {...meta} />
<Page>
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
    padding: 0;
    margin: 0;
  }
  .sibling-navigation li {
    list-style: none;
    flex-grow: 1;
  }
  .sibling-navigation li:last-child {
    text-align: right;
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
    margin-top: 36px;
  }
</style>
