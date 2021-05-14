import path from 'path';
import _get from 'lodash/get.js';

const attrs = `(?:\\s{0,1}[a-zA-z]+=(?:"){0,1}[a-zA-Z0-9]+(?:"){0,1})*`;
const context = `(?:\\s{0,1}context)=(?:"){0,1}module(?:"){0,1}`;
const noncontext = `(?:\\s{0,1}context)=(?:"){0,1}module(?:"){0,1}`;
const RE_NON_MODULE_SCRIPT = new RegExp(`^(<script` + attrs + context + attrs + `>)`);
const RE_MODULE_SCRIPT = new RegExp(`^(<script` + attrs + context + attrs + `>)`);

/**
 * Inject the hydration path into the component props
 */
const preprocessInjectHydrationPath = () => {
  return {
    /**
     * Transform markup: add module script it doesn't exist
     * @param {{content: string, filename: string}} param0 the file data
     * @returns {Promise<{code: string,dependencies?: Array<string>}>} the transformation
     */
    markup: async ({ content, filename }) => {
      // only process svelte files
      if (!['.svelte'].includes(path.extname(filename).toLowerCase())) return { code: content };

      let newContent = content;
      // if there's no script tag, add one.
      if (!content.includes('<script>')) {
        /** @todo: use a fancy regex or something because there's a possibility that we're missing script tags with attributes, e.g. lang="ts"*/
        newContent = `<script></script>\n` + newContent;
      }
      // if there's no normal script, add one.
      if (!content.match(RE_MODULE_SCRIPT)) {
        newContent = `<script context="module"></script>\n` + newContent;
      }

      return { code: newContent };
    },
    /**
     * Transform script
     * @param {{content: string, filename: string}} param0 the file data
     * @returns {Promise<{code: string,dependencies?: Array<string>}>} the transformation
     */
    // @ts-ignore TSLint thinks that attributes isn't on the imported object
    script: async ({ content, attributes, filename }) => {
      // only process svelte files
      // TODO remove condition?
      if (!['.svelte'].includes(path.extname(filename).toLowerCase())) return { code: content };
      // add the component path to the files exports for module exports as well as props props
      content = `\nexport const componentPath = "${filename}";\n${content}`;
      return { code: content };
    },
  };
};

export default preprocessInjectHydrationPath;
