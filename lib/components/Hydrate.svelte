<script>
  import { hasContext, setContext } from 'svelte';

  export let component;
  export let props = {};

  // Don't nest hydrated components
  if (hasContext('5sg_hydrated_component')) {
    throw new Error('Cannot nest hydrated components');
  }
  setContext('5sg_hydrated_component', true);

  // will be injected from child component
  let hydratedComponentPath;

  /** @todo: consider using crypto package or uuid */
  const randomizedDigits = Math.floor(Math.random() * 10e15);
  const id = `hydrated-component-${randomizedDigits}`;

  let stringifiedProps = {};
  try {
    stringifiedProps = JSON.stringify(props);
  } catch (e) {
    /** @todo: do something about it ? */
  }
</script>

{#if component}
  <div {id} data-5sg-hydration-component={hydratedComponentPath}>
    <svelte:component this={component} bind:componentPath={hydratedComponentPath} {...props} />
    <textarea data-5sg-hydration-props style="display: none;">{stringifiedProps}</textarea>
  </div>
{/if}
