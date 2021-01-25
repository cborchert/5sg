// @ts-check

/** @namespace TOTO */

// allows us to import svelte files directly in node without transpilation / bundling
require('svelte/register');

const fs = require('fs');
const path = require('path');
const vfile = require('vfile');

// import local utils
const generateOuterHtml = require('./utils/generateOuterHtml.js');
const generateHydrationCode = require('./utils/generateHydrationCode.js');
const bundleHydrationCode = require('./utils/bundleHydrationCode.js');
const processor = require('./processor.js');
const postProcessor = require('./postProcessor.js');
const { RENDER_DRAFTS, CONTENT_DIR, TEMPLATE_DIR, BUILD_DIR, BASE_DIR } = require('./utils/constants.js');
const { log, forceLog, extendedError, error, time, timeEnd, forceTime, forceTimeEnd } = require('./utils/reporting.js');
const { writeContentToPath, processImage, getFiles } = require('./utils/io.js');
const { REGEX_TRAILING_SLASH, REGEX_LEADING_SLASH, REGEX_INVALID_PATH_CHARS } = require('./utils/regex.js');
const { getPaths } = require('./utils/paths');

/** @todo  we should *not* depend on something in the src folder in the lib */
const defaultTemplatePath = path.join(TEMPLATE_DIR, '/Default.svelte');

// include cofig
let config;
try {
  // eslint-disable-next-line global-require
  config = require('../config.js');
} catch (err) {
  error('ERROR: No config file in config.js using empty config');
  config = {};
}

/**
 * Given settled promises, get fulfilled and handle the errors
 *
 * @param {any[]} settled the settled promises
 * @param {string} errorMessage the error message for handlinf the errors
 * @returns {Array} the values
 */
const getFulfilled = (settled, errorMessage) =>
  settled.reduce((prev, result) => {
    if (result.status !== 'fulfilled') {
      const { reason } = result;
      // handle errors
      extendedError(errorMessage, reason);
      return prev;
    }
    return [...prev, result.value];
  }, []);

/**
 * From an array of page file paths (svelte), generate an array of nodes, where
 *
 *  @todo correctly implement typing
 *  type node = {
 *    data: {
 *      draft: boolean,
 *      initialPath: string, // e.g. /Users/chris/5sg/content/404.svelte
 *      relPath: string, // e.g. 404.svelte
 *      fileName: string, // e.g. 404.svelte
 *      finalPath: string, // e.g. 404.html
 *      modified: string,
 *      created: string,
 *      template: undefined,
 *      frontmatter: {}, // frontmatter
 *    },
 *    contents: "" // processed html
 *    Component: SvelteComponent // used for rendering
 *  }
 *
 * @param {Array=} pageFiles the page files
 * @returns {Object[]} the page data
 */
const processPages = (pageFiles = []) => {
  const pages = [];
  pageFiles.forEach((filePath) => {
    try {
      // eslint doesn't like the import/no-dynamic-require and global-require for this line.
      // eslint-disable-next-line
      const Component = require(filePath);
      // extract data from the Component's exports
      /** @todo use the __5sg__data */
      const { __5sg__data: data = {} } = Component;

      // assign the path data
      const pathData = getPaths(filePath, CONTENT_DIR);
      Object.assign(data, pathData);

      // assign the file meta data
      const fileInfo = fs.statSync(filePath);
      data.modified = fileInfo.mtime;
      data.created = fileInfo.birthtime;

      pages.push({
        contents: '',
        data,
        Component,
      });
    } catch (err) {
      extendedError(`while processing page at ${filePath}`, err);
    }
  });

  return pages;
};

/**
 * From an array of content file paths (markdown), generate an array of nodes, where
 *
 *  type node = {
 *    data: {
 *      draft: boolean,
 *      initialPath: string, // e.g. /Users/chris/5sg/content/blog/post   1.md
 *      relPath: string, // e.g. blog/post   1.md
 *      fileName: string, // e.g. post   1.md
 *      finalPath: string, // e.g. blog/post1.html OR e.g. designated-slug.html
 *      modified: string,
 *      created: string,
 *      template: string,
 *      frontmatter: {}, // frontmatter
 *    },
 *    contents: string // processed html
 *    // ...other vfile fields
 *  }
 *
 * @param {Array=} files the files
 * @returns {Promise<any[]>} the results
 */
const processContent = async (files = []) => {
  // process each file
  const promises = [];
  files.forEach((file) => {
    try {
      promises.push(
        processor.process(
          vfile({
            path: file,
            contents: fs.readFileSync(file),
            cwd: CONTENT_DIR,
            info: fs.statSync(file),
          }),
        ),
      );
    } catch (err) {
      extendedError(`while processing content at ${file}`, err);
    }
  });

  // wait on all files to process
  // NOTE: this is storing ALL file content in a local variable, rather than publishing each file as we go.
  //  This is basically putting more burden on our system's memory in order to avoid I/O ops
  const allResults = await Promise.allSettled(promises);

  // accepting only the fulfilled promises and throwing out all the failed ones.
  const results = getFulfilled(allResults, 'while processing content');

  return results;
};

const postProcessContent = async (processedContent = []) => {
  // extract meta data for each file
  //  => { relative/path/name.md: {...nodeData} }
  const nodeData = Object.fromEntries(processedContent.map(({ data }) => [data.relPath, data]));
  const { siteMetadata } = config;

  // we'll store the images to be processed hsvelteere
  const imageMap = {};
  const promises = [];
  const templates = {
    Default: require(defaultTemplatePath),
  };

  processedContent.forEach((processed) => {
    const { contents: htmlContent, data = {}, Component } = processed;
    const { initialPath, relPath, template = 'Default' } = data;

    // if a component has been included, the initial path is the renderedTemplatePath
    let renderedTemplatePath = Component ? initialPath : '';
    try {
      // load the Svelte template component used for the current content
      // If a Component prop was identified, we'll use that
      let templateModule = Component || templates[template];
      // if template is not stored in map
      if (!templateModule) {
        // we haven't used this template yet.
        // no big deal, look it up!
        const templatePath = path.join(TEMPLATE_DIR, `${template}.svelte`);
        try {
          // eslint doesn't like the following line because of the rules global-require import/no-dynamic-require
          // eslint-disable-next-line
          templateModule = require(templatePath);
          templates[template] = templateModule;
          renderedTemplatePath = templatePath;
        } catch (err) {
          // ...ok the template has something wrong with it.
          // inform the user
          extendedError(`while loading template file ${templatePath} (used by ${initialPath})`, err);
          // and use the default template
          templateModule = require(defaultTemplatePath);
          renderedTemplatePath = defaultTemplatePath;
        }
      }

      // get the template and the template props from the template module
      // if __5sg__hydrate === true, we'll hydrate
      const {
        default: Template,
        __5sg__hydrate: hydrate,
        __5sg__deriveProps: deriveProps = () => ({}),
      } = templateModule;

      /**
       * prepare the props
       */
      const props = {
        htmlContent,
        data,
        isDraft: data.draft,
        siteMetadata,
        // inject all the props derived from the node data
        ...deriveProps({ nodeData, data }),
      };

      // only generate publishable content
      // inject the data and html into the template
      const { html, css: { code: styles = '' } = {}, head: templateHeadContent } = Template.render({
        ...props,
      });
      let head = templateHeadContent;

      if (hydrate) {
        try {
          // Create hydration file path name from relPath
          // e.g. /path/to/page.hydrate.svelte => path--to--page_hydrate_svelte.js
          const hydrationFileBase = relPath
            .replace(REGEX_LEADING_SLASH, '')
            .replace(REGEX_INVALID_PATH_CHARS, '-')
            .replace(/\./g, '_')
            .replace(/\//g, '--');
          const hydrationFilePath = `${hydrationFileBase}.js`;

          // Write hydration code to cache
          const hydrationPrebuildPath = `/.5sg/cache/prebuild/${hydrationFilePath}`;
          const hydrationCode = generateHydrationCode({ path: renderedTemplatePath, props });
          writeContentToPath({
            fileContent: hydrationCode,
            outputPath: hydrationPrebuildPath,
            outputBase: BASE_DIR,
            onSuccess: (logPath, finalPath) => {
              log(`Prebuilt the hydration code for ${relPath} at ${finalPath}`);
            },
          });

          // Generate code using rollup and write to dist directory
          const hydrationBuildPath = `/build/scripts/${hydrationFilePath}`;
          bundleHydrationCode(path.join(BASE_DIR, hydrationPrebuildPath), path.join(BUILD_DIR, hydrationBuildPath));

          // Add script input to html head
          head += `<script defer src="${hydrationBuildPath}"></script>`;
        } catch (err) {
          extendedError(`while generating hydration code for ${relPath}`);
        }
      }

      const pageContent = generateOuterHtml({ html, styles, head });
      promises.push(
        postProcessor.process(
          vfile({
            path: initialPath,
            contents: pageContent,
            cwd: CONTENT_DIR,
            // this will be used to verify links to local files
            nodeData,
            // this will be updated with any local images so we know where to write
            imageMap,
            // include previously generated data so we don't lose it
            data,
            siteMetadata,
          }),
        ),
      );
    } catch (err) {
      extendedError(`while post processing content at ${initialPath}`, err);
    }
  });

  // wait on all files to process
  // NOTE: this is storing ALL file content in a local variable, rather than publishing each file as we go.
  //  This is basically putting more burden on our system's memory in order to avoid I/O ops
  const allResults = await Promise.allSettled(promises);

  // accepting only the fulfilled promises and throwing out all the failed ones.
  // const results = allResults.filter(({ status }) => status === 'fulfilled').map(({ value }) => value);
  const results = getFulfilled(allResults, 'while post processing content');
  return { results, images: imageMap };
};

/**
 * For each image in the image map, process the image
 *
 * @param {Object=} imageMap the map of paths to image nodes
 */
const publishImages = (imageMap = {}) => {
  Object.entries(imageMap).forEach(([originalPath, { src: outputPath }]) => {
    processImage({ originalPath, outputPath });
  });
};

/**
 * For each node in the content array, publish the file
 *
 * @param {Object[]} content the content nodes
 * @returns {void}
 */
const publishContent = (content) => {
  content.forEach((node) => {
    const { contents: fileContent = '', data = {} } = node;
    const { finalPath: outputPath, initialPath } = data;
    try {
      if (!fileContent || !outputPath) {
        throw new Error('Missing content or path');
      }
      writeContentToPath({
        fileContent,
        outputPath,
        onSuccess: (logPath, finalPath) => {
          if (finalPath !== logPath) {
            log(`Serving the page for ${initialPath} at ${logPath}`);
          } else {
            log(`Created the page for ${initialPath} at ${finalPath}`);
          }
        },
      });
    } catch (err) {
      extendedError(`while post publishing content from ${initialPath}`, err);
    }
  });
};

/**
 * Create sitemap.txt using page nodes and config.siteMetadata.siteUrl
 * See more here: https://developers.google.com/search/docs/advanced/sitemaps/build-sitemap
 *
 * @param {Object[]} nodes the content nodes
 * @returns {void}
 */
const createSiteMap = (nodes) => {
  if (!config.generateSitemap) return;
  // for every node, e.g. {data: {finalPath: '/blog/post1.html'}} return 'http://www.example.com/blog/post1.html'
  const pages = nodes
    .map(
      ({ data }) =>
        (data &&
          data.finalPath &&
          `${config.siteMetadata.siteUrl.trim().replace(REGEX_TRAILING_SLASH, '')}/${data.finalPath
            .trim()
            .replace(REGEX_LEADING_SLASH, '')}`) ||
        null,
    )
    .filter((a) => a);
  writeContentToPath({
    fileContent: pages.join('\n'),
    outputPath: '/sitemap.txt',
    onSuccess: (logPath, finalPath) => {
      // add to robots.txt, if it exists
      fs.appendFileSync(
        path.join(BUILD_DIR, '/robots.txt'),
        `Sitemap: ${config.siteMetadata.siteUrl.trim().replace(REGEX_TRAILING_SLASH, '')}/sitemap.txt`,
      );
      if (finalPath !== logPath) {
        log(`Serving the sitemap at ${logPath}`);
      } else {
        log(`Created the sitemap at ${finalPath}`);
      }
    },
  });
};

/**
 * Create site.webmanifest using config
 * See more here: https://developer.mozilla.org/en-US/docs/Web/Manifest
 */
const createManifest = () => {
  if (!config.generateManifest) return;
  const manifest = {
    name: config.siteMetadata.name,
    short_name: config.siteMetadata.short_name,
    description: config.siteMetadata.description,
    icons: config.siteMetadata.icons,
    theme_color: config.siteMetadata.theme_color,
    background_color: config.siteMetadata.background_color,
    display: config.siteMetadata.display,
  };
  writeContentToPath({
    fileContent: JSON.stringify(manifest),
    outputPath: '/site.webmanifest',
    onSuccess: (logPath, finalPath) => {
      if (finalPath !== logPath) {
        log(`Serving the web manifest at ${logPath}`);
      } else {
        log(`Created the web manifest at ${finalPath}`);
      }
    },
  });
};

/**
 * Process content and images, and write to build filder
 */
async function generateContent() {
  forceTime('Build complete');
  forceLog('Generating content...');

  time('Getting files');
  // get all markdown files for processing
  const contentFiles = getFiles(CONTENT_DIR, ['md']);

  forceLog(`Content nodes found: ${contentFiles.length}`);
  timeEnd('Getting files');

  time('Processing content');
  // render html content and meta data for each content file
  const processedContent = await processContent(contentFiles);

  // remove drafts if we're not allowing drafts to be published
  const publishableContent = RENDER_DRAFTS ? processedContent : processedContent.filter(({ data }) => !data.draft);
  timeEnd('Processing content');

  time('Getting pages');
  // get all svelte files for processing
  const pageFiles = getFiles(CONTENT_DIR, ['svelte']);

  forceLog(`Page nodes found: ${pageFiles.length}`);
  timeEnd('Getting pages');

  time('Processing pages');
  // Process any .svelte files
  // making sure that the output is {contents: "", Component: require(path).default, data: {initialPath, fileInfo, etc. }}
  /** @todo Import svx as well */
  const processedPages = processPages(pageFiles);
  timeEnd('Processing pages');

  time('Creating dynamic pages');
  // create dynamic pages
  const dynamicPages =
    config && config.createDynamicPages ? config.createDynamicPages([...publishableContent, ...processedPages]) : [];
  timeEnd('Creating dynamic pages');

  time('Post processing html');
  // get final processed HTML content and the images to be processed
  const { results: finalContent = [], images = [] } = await postProcessContent([
    ...publishableContent,
    ...processedPages,
    ...dynamicPages,
  ]);
  timeEnd('Post processing html');

  time('Publishing content');
  // write final content to files
  forceLog(`Building html for ${finalContent.length} nodes...`);
  publishContent(finalContent);
  timeEnd('Publishing content');

  time('Publishing images');
  // process and write images
  forceLog(`Processing ${Object.keys(images).length} images...`);
  publishImages(images);
  timeEnd('Publishing images');

  time('Publishing meta');
  // finishing touches: sitemap and sitemanifest
  createSiteMap(finalContent);
  createManifest();
  timeEnd('Publishing meta');

  forceLog(`Done`);
  forceTimeEnd('Build complete');
}

module.exports = generateContent;
