import path from 'path';
import _get from 'lodash/get.js';
import remark from 'remark';
import frontmatter from 'remark-frontmatter';
import parseFrontmatter from 'remark-parse-frontmatter';
import html from 'remark-html';

/**
 * @typedef {Object} PreprocessorConfig
 * @property {Object=} layouts key: the name of the layout, val: the path of the layout svelte component
 * @property {Array<any>=} remarkPlugins an array of remark plugins
 */

/**
 * Transform markdown to svelte component
 * @param {PreprocessorConfig=} config
 * @returns
 */
const preprocessMarkdown = ({ layouts = {}, remarkPlugins = [] } = {}) => {
  const processor = remark();
  // parse frontmatter
  processor.use(frontmatter).use(parseFrontmatter);
  // apply the custom plugins
  remarkPlugins.forEach((plugin) => {
    if (Array.isArray(plugin)) {
      const [pluginFn, options] = plugin;
      processor.use(pluginFn, options);
    } else {
      processor.use(plugin);
    }
  });
  // render html
  processor.use(html);

  return {
    /**
     * Transform markup
     * @param {{content: string, filename: string}} param0 the file data
     * @returns {Promise<{code: string,dependencies?: Array<string>}>} the transformation
     */
    markup: async ({ content, filename }) => {
      // cannot process non markdown files
      if (!['.md', '.markdown'].includes(path.extname(filename).toLowerCase())) return { code: content };

      try {
        const parsed = await processor.process(content);
        // get the layout component path
        const metadata = _get(parsed, 'data.frontmatter', {});
        let { layout } = metadata;
        const doNotUseLayout = layout === false;
        let importLayoutPath = '';
        let layoutPath = '';
        if (layouts && !doNotUseLayout) {
          // if layout is FALSE then the file should not get a layout
          // otherwise, try to get the path for the layout
          layoutPath = (layout && layouts[layout.toLowerCase()]) || '';
          // if we were not able to get a layout, then try to infer it from the containing folder
          if (!doNotUseLayout && layoutPath === '') {
            // get the name of the folder inside /src/content
            // e.g. /src/content/blog/path/to/post.md => 'blog';
            const contentDirectoryName =
              path
                .dirname(filename)
                .replace(/^src\/content\/?/, '')
                .split('/')[0] || '_';

            // get the layout path based on the directory name, otherwise fallback to layouts._
            layoutPath = layouts[contentDirectoryName.toLowerCase()] || layouts['_'] || '';
          }
          if (layoutPath) {
            importLayoutPath = path.relative(path.dirname(filename), layoutPath);
          }
        }

        const { data, messages, history, cwd, contents } = parsed;

        /**
         * @todo consider doing this in a way that would keep existing script tags intact
         * that way we could basically mimic mdx
         */

        // form script context="module" tag
        let layoutInternalsStatement = importLayoutPath
          ? `import LAYOUT_5SG, * as layoutInternals from '${importLayoutPath}';`
          : 'const layoutInternals = {};';
        let layoutPathStatement = `const layoutPath = '${layoutPath || ''}';`;
        const metadataString = metadata ? JSON.stringify(metadata) : '{}';
        let metadataStatement = `const metadata = ${metadataString};`;
        let moduleTag = `<script context="module">`;
        moduleTag += `\n\t${layoutInternalsStatement}`;
        moduleTag += `\n\t${layoutPathStatement}`;
        moduleTag += `\n\t${metadataStatement}`;
        moduleTag += `\n\tconst {deriveProps = ()=>{}} = layoutInternals;`;
        moduleTag += '\n\texport {metadata, layoutPath, deriveProps};';
        moduleTag += `\n</script>`;

        /**
         * @todo same here. If we don't support mdsvex, then we can imitate it here by making htmlContent = content, and parsing certain parts (paying special attention to code fences)
         */
        // form content
        let htmlContent = `{@html \`${contents.toString().replace('`', '\\``')}\`}`;
        if (importLayoutPath) {
          let openTag = `<LAYOUT_5SG {metadata} {...$$props}>`;
          const closeTag = `</LAYOUT_5SG>`;
          htmlContent = `${openTag}\n\t${htmlContent}\n${closeTag}`;
        }

        const code = `${moduleTag}\n\n${htmlContent}`;

        return { code };
      } catch (e) {
        return { code: '' };
      }
    },
  };
};

export default preprocessMarkdown;
