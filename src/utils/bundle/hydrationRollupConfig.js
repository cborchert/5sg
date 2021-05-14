import path from 'path';
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import multiInput from 'rollup-plugin-multi-input';
import del from 'rollup-plugin-delete';

const hydrationRollupConfig = {
  input: path.join(process.cwd(), `.5sg/build/hydration/*.js`),
  output: {
    dir: path.join(process.cwd(), `public/scripts/hydration`),
    entryFileNames: '[name]-[hash].js',
    sourcemap: true,
    format: 'iife',
  },
  plugins: [
    multiInput.default({ relative: path.join(process.cwd(), `.5sg/build/hydration/`) }),
    del({ targets: `public/scripts/hydration` }),
    svelte({
      /** @see https://github.com/sveltejs/rollup-plugin-svelte#extracting-css */
      emitCss: false,

      // You can pass any of the Svelte compiler options
      compilerOptions: {
        hydratable: true,
        dev: true,
        immutable: true,
      },
    }),
    resolve({ browser: true, dedupe: ['svelte'] }),
  ],
};

export default hydrationRollupConfig;
