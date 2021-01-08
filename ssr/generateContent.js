// allows us to import svelte files directly in node without transpilation / bundling
require('svelte/register');

const fs = require('fs');
const path = require('path');
const vfile = require('vfile');

// import local utils
const generateOuterHtml = require('./util/generateOuterHtml.js');
const processor = require('./processor.js');
const postProcessor = require('./postProcessor.js');
const { RENDER_DRAFTS, CONTENT_DIR, TEMPLATE_DIR } = require('./util/constants.js');
const { log, forceLog, extendedError } = require('./util/reporting.js');
const { writeContentToPath, processImage, getFiles } = require('./util/io.js');
const DefaultContentTemplate = require('../frontend/templates/Default.svelte').default;

/**
 * Given settled promises, get fulfilled and handle the errors
 * @param {array} settled the settled promises
 * @param {string} errorMessage the error message for handlinf the errors
 */
const getFulfilled = (settled, errorMessage) =>
  settled.reduce((prev, { status, value, reason }) => {
    if (status !== 'fulfilled') {
      // handle errors
      extendedError(errorMessage, reason);
      return prev;
    }
    return [...prev, value];
  }, []);

/**
 * From an array of file paths, generate an array of nodes, where
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
 *      seo: {
 *        title: string,
 *        description: string,
 *      }
 *      frontmatter: {}, // frontmatter
 *    },
 *    contents: string // processed html
 *    // ...other vfile fields
 *  }
 */
const processContent = async (files) => {
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

const postProcessContent = async (processedContent) => {
  // extract meta data for each file
  //  => { relative/path/name.md: {...nodeData} }
  const nodeData = Object.fromEntries(processedContent.map(({ data }) => [data.relPath, data]));
  // we'll store the images to be processed here
  const imageMap = {};
  const promises = [];
  const templates = {
    Default: DefaultContentTemplate,
  };

  processedContent.forEach((processed) => {
    const { contents: htmlContent, data = {} } = processed;
    const { initialPath, template = 'Default' } = data;

    try {
      // load the Svelte template component used for the current page page
      let Template = templates[template];
      // if template is not stored in map
      if (!Template) {
        // we haven't used this template yet.
        // no big deal, look it up!
        const templatePath = path.join(TEMPLATE_DIR, `${template}.svelte`);
        try {
          // eslint doesn't like the following line because of the rules global-require import/no-dynamic-require
          // eslint-disable-next-line
          Template = require(templatePath).default;
          templates[template] = Template;
        } catch (err) {
          // ...ok the template has something wrong with it.
          // inform the user
          extendedError(`while loading template file ${templatePath} (used by ${initialPath})`, err);
          // and use the default template
          Template = DefaultContentTemplate;
        }
      }

      // only generate publishable content
      // inject the data and html into the template
      // TODO: Handle mutliple templates
      const { html, css: { code: styles = '' } = {}, head } = Template.render({
        htmlContent,
        data,
        isDraft: data.draft,
        nodeData,
      });
      const pageContent = generateOuterHtml({ html, styles, head });
      promises.push(
        postProcessor.processSync(
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
 * @param {Object} imageMap
 */
const publishImages = (imageMap) => {
  Object.entries(imageMap).forEach(([originalPath, { src: outputPath }]) => {
    processImage({ originalPath, outputPath });
  });
};

/**
 * For each node in the content array, publish the file
 * @param {array} content
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
 * Process content and images, and write to build filder
 */
async function generateContent() {
  forceLog('Generating content...');

  // get all markdown files for processing
  const contentFiles = getFiles(CONTENT_DIR, ['md']);

  forceLog(`Content nodes found: ${contentFiles.length}`);

  // render html content and meta data for each content file
  // TODO: We can handle svelte/svx files here
  //  making sure that the output is {contents: HTML, data: {initialPath, fileInfo, etc. }}
  const processedContent = await processContent(contentFiles);

  // TODO: create individual and dynamic pages

  // remove drafts if we're not allowing drafts to be published
  const publishableContent = RENDER_DRAFTS ? processedContent : processedContent.filter(({ data }) => !data.draft);

  // get final processed HTML content and the images to be processed
  const { results: finalContent = [], images = [] } = await postProcessContent(publishableContent);

  // write final content to files
  forceLog(`Building html for ${finalContent.length} nodes...`);
  publishContent(finalContent);

  // process and write images
  forceLog(`Processing ${Object.keys(images).length} images...`);
  publishImages(images);

  forceLog(`Done`);
}

module.exports = generateContent;
