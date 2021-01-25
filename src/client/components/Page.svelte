<script>
  import Globals from './Globals.svelte';
  import Header from './Header.svelte';
  import Meta from './Meta.svelte';
  export let meta = {};
</script>

<Meta {...meta} />
<body>
  <Header />
  <slot name="beforeMain" />
  <main>
    <slot name="beforeContent" />
    <slot />
    <slot name="afterContent" />
  </main>
  <Globals />
</body>

<style>
  main {
    max-width: 1024px;
    margin: 0 auto;
    padding: 16px 32px 64px;
  }
</style>
