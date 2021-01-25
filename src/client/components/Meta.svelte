<script>
  export let siteMetadata = {};
  const { name: siteTitle = '' } = siteMetadata || {};

  export let title;
  export let description;
</script>

<svelte:head>
  <title>{title || ''} -- {siteTitle}</title>
  <meta name="description" content={description} />
</svelte:head>
