<script>
  import Globals from './Globals.svelte';
  import Header from './Header.svelte';
</script>

<body>
  <Header />
  <slot name="beforeMain" />
  <section class="bleed">
    <slot name="bleed" />
    <main class="main-bleed">
      <slot name="bleedMain" />
    </main>
  </section>
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
    padding: 0 32px 64px;
  }
  main.main-bleed {
    max-width: 1400px;
    padding-bottom: 0;
  }
</style>
