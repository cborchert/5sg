<script>
  /** @todo conditional import? If config doesn't exist, this is going to crash */
  import * as config from '../../../config';
  console.log(config);
  const { siteMetadata } = config || {};
  const { name: siteTitle = '' } = siteMetadata || {};

  export let title;
  export let description;
</script>

<svelte:head>
  <title>{title || ''} -- {siteTitle}</title>
  <meta name="description" content={description} />
</svelte:head>
