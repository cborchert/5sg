/** @todo during development, this will be from the .5sg/build/hydration folder, but later this path must be towards the npm library */
const pathTo5sgLib = '../../../5sg';
/** @todo there has to be a better way to do this */
const pathToRoot = '../../..';

/**
 * Creates the script to hydrate the component on the page
 * @param {string} path the path to the component from the root folder
 * @returns {string} the component hydration code
 */
export default function createComponentHydrationScript(path) {
  return `
import hydrateComponent from "${pathTo5sgLib}/bundle/hydration/hydrateComponent.js";
import Component from "${pathToRoot}/${path}";

export default hydrateComponent({
    Component,
    selector: '[data-5sg-hydration-component="${path}"]',
});
    `;
}
