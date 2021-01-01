<script>
    export let htmlContent = "";

    export let data = {};
    const frontmatter = data.frontmatter || {};
    const { title: htmlTitle } = frontmatter;
</script>

<style>
    :global(body) {
        font-family: Arial, Helvetica, sans-serif;
        color: #333;
        background: #eee;
    }

    main {
        max-width: 1024px;
        margin: 0 auto;
        padding: 32px 16px 64px;
    }
</style>

<svelte:head>
    <title>{htmlTitle}</title>
</svelte:head>

<main>
    {@html htmlContent}
</main>
