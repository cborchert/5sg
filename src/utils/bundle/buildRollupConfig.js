import _get from 'lodash/get.js';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import multiInput from 'rollup-plugin-multi-input';
import del from 'rollup-plugin-delete';
import commonjs from '@rollup/plugin-commonjs';

import gemoji from 'remark-gemoji';
import highlight from 'remark-highlight.js';
import gfm from 'remark-gfm';

/** @todo: export for use by 3rd parties */
import preprocessMarkdown from './preprocessMarkdown.js';
import preprocessInjectHydrationPath from './preprocessInjectHydrationPath.js';

/**
 * Builds the rollup config for a given content directory
 * @param {Object} options
 * @param {string} options.srcDir the user src directory which should contain the content directory
 * @param {string} options.buildDir the path to the build directory
 * @param {Array<string>=} options.targets the targets of the build, can be glob or path
 * @param {Object=} options.config the user config
 * @returns {Object} rollupConfig
 */
/** @todo: consider adding ts to the mix, right ?  */
const buildRollupConfig = ({ srcDir, buildDir, targets = [`/**/*.svelte`, `/**/*.md`, `/**/*.js`], config = {} }) => {
  // if the user has defined preprocessors in the config, use that
  const preprocessors = _get(config, 'preprocessors', [
    // otherwise, use the layouts and remarkPlugins from the config
    preprocessMarkdown({
      layouts: _get(config, 'layouts'),
      remarkPlugins: _get(config, 'remarkPlugins', [highlight, gfm, gemoji]),
    }),
    // and handle partial hydration
    preprocessInjectHydrationPath(),
  ]);
  return {
    input: targets.map((target) => `${srcDir}${target}`),
    treeshake: false,
    output: {
      dir: `${buildDir}/bundled`,
      entryFileNames: '[name]-[hash].js',
      sourcemap: 'inline',
    },
    plugins: [
      multiInput.default({ relative: `${srcDir}` }),
      del({ targets: `${buildDir}/bundled` }),
      svelte({
        // By default, all ".svelte" files are compiled
        extensions: ['.svelte', '.md'],
        preprocess: preprocessors,

        // Emit CSS as "files" for other plugins to process. default is true
        /** @see https://github.com/sveltejs/rollup-plugin-svelte#extracting-css */
        emitCss: false,

        // You can pass any of the Svelte compiler options
        compilerOptions: {
          generate: 'ssr',
          hydratable: true,
          dev: true,
          immutable: true,
        },
      }),
      // resolve({ browser: true, dedupe: ['svelte'] }),
      resolve({ browser: true, exportConditions: ['node'] }),

      commonjs(),
    ],
  };
};

export default buildRollupConfig;
