/**
 * Mounts the component to all instances of a given selector
 *
 * @param {Object} param0
 * @param {*} param0.Component the svelte component
 * @param {string} param0.selector the selector to mount the component
 */
export default function hydrateComponent({ Component, selector }) {
  // @ts-ignore this is a DOM method
  if (typeof document === 'undefined') return;

  // get all the selectors that match the selector
  // @ts-ignore this is a DOM method
  const targets = document.querySelectorAll(selector);
  const instances = [];

  targets.forEach((target) => {
    if (target) {
      const propsContainer = target.querySelector('[data-5sg-hydration-props]');
      let props = {};

      try {
        if (propsContainer && propsContainer.value) props = JSON.parse(propsContainer.value);
      } catch {
        props = {};
      }

      // remove existing content
      target.innerHTML = '';

      const instance = new Component({
        target,
        props,
      });
      instances.push(instance);
    }
  });

  return instances;
}
