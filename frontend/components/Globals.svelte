<svelte:head>
  <!-- site manifest and favicons-->
  <link rel="manifest" href="/static/site.webmanifest" />
  <link rel="icon" type="image/png" href="/static/favicon/favicon.ico" />

  <!-- import global css -->
  <!-- css reset -->
  <link rel="stylesheet" href="/static/styles/normalize.css" />
  <!-- global styles -->
  <link rel="stylesheet" href="/static/styles/global.css" />
  <!-- highlight.js theme for highlighting code blocks (for blogs and documentation sites, etc.) -->
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/10.5.0/styles/solarized-dark.min.css" />

  <!-- import global js -->
  <!-- turbolinks for giving page navigation a more native feel -->
  <script defer src="https://cdn.jsdelivr.net/npm/turbolinks@5.2.0/dist/turbolinks.min.js">
  </script>
  </script>
</svelte:head>

<body>
  <!-- import custom global js -- handles turbolinks and highlight.js -->
  <script defer src="/static/scripts/global.js">
  </script>
</body>
