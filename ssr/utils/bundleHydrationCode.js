// @ts-check

const rollup = require('rollup');
const svelte = require('rollup-plugin-svelte');
const resolve = require('@rollup/plugin-node-resolve').default;

/**
 * Use rollup to create a bundle file for the hydrated component
 *
 * @param {string} inputPath the file to bundle
 * @param {string} outputPath where to save the bundle
 */
async function bundleHydrationCode(inputPath, outputPath) {
  // create a bundle
  const bundle = await rollup.rollup({
    input: inputPath,
    plugins: [
      // @ts-ignore
      svelte({
        compilerOptions: {
          hydratable: true,
        },
        // don't generate the css (already done and injected into the html)
        emitCss: false,
      }),
      resolve({
        browser: true,
        dedupe: ['svelte'],
      }),
    ],
  });

  // or write the bundle to disk
  await bundle.write({
    sourcemap: true,
    format: 'iife',
    /** @todo when we use partial hydration, this may need to be unique!  */
    name: 'hydratedComponent',
    file: outputPath,
  });

  // closes the bundle
  await bundle.close();
}

module.exports = bundleHydrationCode;
