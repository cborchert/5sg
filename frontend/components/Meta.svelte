<script>
  export let siteMetadata = {};
  export let title;
  export let description;
  const { name: siteTitle = '' } = siteMetadata;
</script>

<svelte:head>
  <title>{title || ''} -- {siteTitle}</title>
  <meta name="description" content={description} />
</svelte:head>
