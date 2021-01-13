<script>
  import Page from '../components/Page.svelte';
  import { getCategoryNames, getCategorySlug, getTagNames, getTagSlug } from '../../config/blogHelpers';

  // the rendered content from the source
  export let htmlContent = '';
  // the data relative to this content
  export let data = {};
  // the data relative to all nodes
  export let nodeData = {};

  // extract site title for use in title tag
  export let siteMetadata = {};
  const { name: siteTitle = '' } = siteMetadata;

  // extract frontmatter for seo and page header/attrution
  const frontmatter = data.frontmatter || {};
  const { title: metaTitle, description: metaDescription } = data.seo || {};
  const { title, date, author } = frontmatter;
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

<svelte:head>
  <title>{metaTitle || ''} -- {siteTitle}</title>
  <meta name="description" content={metaDescription} />
</svelte:head>

<Page>
  <header>
    {#if title}
      <h1>{title}</h1>
    {/if}
    {#if attribution}
      <h3>{attribution}</h3>
    {/if}
    <h4>Categories:</h4>
    {#if categories && categories.length > 0}
      <ul>
        {#each categories as category}
          <li><a href={`${getCategorySlug(category)}.dynamic`}>{category}</a></li>
        {/each}
      </ul>
    {/if}
    {#if tags && tags.length > 0}
      <h4>Tags:</h4>
      <ul>
        {#each tags as tag}
          <li><a href={`${getTagSlug(tag)}.dynamic`}>#{tag}</a></li>
        {/each}
      </ul>
    {/if}
  </header>
  <div>
    {@html htmlContent}
  </div>
  <footer>
    <nav>
      <ul>
        <li>
          {#if prevPost}<a href={prevPost.relPath}>← {prevPost.frontmatter.title}</a>{/if}
        </li>
        <li>
          {#if nextPost}<a href={nextPost.relPath}>{nextPost.frontmatter.title} →</a>{/if}
        </li>
      </ul>
    </nav>
  </footer>
</Page>
