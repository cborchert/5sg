// @ts-check

/**
 * Prepares the content of a file to hydrate the given component
 *
 * @param {Object} param0
 * @param {string} param0.path the path to the component file to import
 * @param {Object=} param0.props the props to inject into the hydrated component. Must be JSON stringifiable
 * @param {string=} param0.target the hydration target in the dom, defaults to document.body
 * @returns {string} the final code
 */
function generateHydrationCode({ path, props = {}, target = 'document.body' }) {
  return `
  import HydratedComponent from "${path}";
  const hydratedComponent = new HydratedComponent({
    target: ${target},
    props: ${JSON.stringify(props)},
    hydrate: true,
  });
  export default hydratedComponent;
  `;
}

module.exports = generateHydrationCode;
