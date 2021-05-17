import path from 'path';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import multiInput from 'rollup-plugin-multi-input';
import del from 'rollup-plugin-delete';
import commonjs from '@rollup/plugin-commonjs';

/** @TODO make conditional or include in the config */
import gemoji from 'remark-gemoji';
import footnotes from 'remark-footnotes';
import highlight from 'remark-highlight.js';
import gfm from 'remark-gfm';

import preprocessMarkdown from './preprocessMarkdown.js';
import preprocessInjectHydrationPath from './preprocessInjectHydrationPath.js';
/**
 * Builds the rollup config for a given content directory
 * @param {string} srcDir the user src directory which should contain the content directory
 * @param {string} buildDir the path to the build directory
 * @param {Array<string>=} targets the targets of the build, can be glob or path
 * @returns {Object} rollupConfig
 */
/** @todo: consider adding ts to the mix, right ?  */
const buildRollupConfig = (srcDir, buildDir, targets = [`/**/*.svelte`, `/**/*.md`, `/**/*.js`]) => {
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
      del({ targets: buildDir }),
      svelte({
        // By default, all ".svelte" files are compiled
        extensions: ['.svelte', '.md'],
        preprocess: [
          preprocessMarkdown({
            /** @todo pass layouts into config */
            layouts: { blog: `src/layouts/Blog.svelte`, _: `src/layouts/Page.svelte` },
            /** @todo pass remark plugins into config */
            remarkPlugins: [highlight, gfm, gemoji, footnotes],
          }),
          preprocessInjectHydrationPath(),
        ],

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
