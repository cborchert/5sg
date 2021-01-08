<script>
  import Globals from './Globals.svelte';
  import Header from './Header.svelte';
</script>

<style>
  main {
    max-width: 1024px;
    margin: 0 auto;
    padding: 32px 16px 64px;
  }
</style>

<body>
  <Header />
  <main>
    <slot name="beforeContent" />
    <slot />
    <slot name="afterContent" />
  </main>
  <Globals />
</body>
