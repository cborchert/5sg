// allows us to import svelte files directly in node without transpilation / bundling
require('svelte/register');

const fs = require('fs');
const path = require('path');
const vfile = require('vfile');
const { RENDER_DRAFTS, CONTENT_DIR } = require('./constants.js');
const { log, error, forceLog } = require('./util/reporting.js');

// import local utils
const generateHtml = require('./generateHtml');
const getFiles = require('./getFiles.js');
const processor = require('./processor.js');
const postProcessor = require('./postProcessor.js');

// load the Svelte template component used to create a page
const Template = require('../frontend/templates/Page.svelte').default;

forceLog('Generating content...');

/**
 *
 * @param {Function} handleContent
 */
async function generateContent(handleContent, processImage) {
  // for each md and each svelte file in ./content create a page

  const contentFiles = getFiles(CONTENT_DIR, ['md', 'svelte']);
  forceLog(`Content nodes found: ${contentFiles.length}`);
  forceLog(`Building html for nodes...`);

  const nodes = {};
  const nodeMap = {};
  const imageMap = {};

  // PREPROCESSING
  contentFiles.forEach((file) => {
    try {
      // get the path for the page
      // e.g. ./content/path/to/myPage.md => ./build/path/to/myPage.html
      const relPath = file.replace(CONTENT_DIR, '');

      let outputPathBase = relPath
        .replace(/\.[^.]*$/, '')
        .replace(/[^A-Za-z0-9_\-/.]/g, '')
        .toLowerCase();
      let outputPath = `${outputPathBase}.html`;

      let pageContent = '';
      let publishContent = true;

      const fileExtension = path.extname(file);

      if (fileExtension === '.md') {
        // handle markdown

        // convert the file's text into html
        const content = fs.readFileSync(file);
        const processed = processor.processSync(
          vfile({
            path: file,
            contents: content,
            cwd: CONTENT_DIR,
          }),
        );
        const { contents: htmlContent, data = {} } = processed;

        // allow for unpublished drafts
        const isDraft = !!(data.frontmatter && data.frontmatter.draft);
        publishContent = !isDraft || RENDER_DRAFTS;

        // allow for custom path, properly formatted, retrieved from path, permalink, slug, or route in the frontmatter
        const frontmatterPath = data.frontmatter
          ? data.frontmatter.permalink || data.frontmatter.path || data.frontmatter.route || data.frontmatter.slug
          : '';
        if (frontmatterPath)
          outputPathBase = frontmatterPath
            .replace(/^\.?\//, '')
            .replace(/\.[^.]*$/, '')
            .replace(/[^A-Za-z0-9_\-/.]/g, '')
            .toLowerCase();
        outputPath = `${outputPathBase}.html`;

        // only generate publishable content
        if (publishContent) {
          // inject the data and html into the template
          const { html, css, head } = Template.render({
            htmlContent,
            data,
            isDraft,
          });
          pageContent = generateHtml({ html, css, head });
        }
      } else if (fileExtension === '.svelte') {
        // only generate publishable content
        if (publishContent) {
          // handle svelte
          // import the svelte file and render it

          // TODO: FIXME? eslint doesn't like the import/no-dynamic-require and global-require for this line.
          // eslint-disable-next-line
          const Page = require(file).default;
          const { html, css, head } = Page.render();

          // inject the rendered component into the html shell template
          pageContent = generateHtml({ html, css, head });
        }
      }

      // add beginning slash to output path
      if (!outputPath.startsWith('/')) {
        outputPath = `/${outputPath}`;
      }

      // TODO: look into saving content in a cache.
      //  Storing in working memory will probably be too taxing for large number of files...
      //  the disadvantage is that more i/o ops will slow things down... to verify
      nodes[file] = {
        outputPath,
        pageContent,
        fileExtension,
        publishContent,
      };
      // add to nodeMap for lookups
      nodeMap[relPath] = outputPath;
      // allow both links starting with / and without /
      if (!relPath.startsWith('/')) {
        nodeMap[`/${relPath}`] = outputPath;
      } else {
        nodeMap[relPath.replace(/^\//, '')] = outputPath;
      }
    } catch (err) {
      error(`======================\nERROR PREPROCESSING PAGE:\n----------------------\n`);
      error(err);
      error(
        `\n----------------------\nThe above error was encountered while preprocessing the page for ${file}\n======================\n`,
      );
    }
  });

  // post process / publish
  Object.entries(nodes).forEach(([originalPath, { outputPath, pageContent: initialContent, publishContent }]) => {
    // only publish publishable content
    if (publishContent) {
      try {
        // forceLog(originalPath, outputPath);
        // post process
        const processed = postProcessor.processSync(
          vfile({
            path: originalPath,
            contents: initialContent,
            cwd: CONTENT_DIR,
            nodeMap,
            imageMap,
            processImage,
          }),
        );
        const { contents: finalContent } = processed;

        // publish
        handleContent({
          outputPath,
          pageContent: finalContent,
          onSuccess: (finalPath) => {
            log(`Created the page for ${originalPath} at ${finalPath}`);
          },
        });
      } catch (err) {
        error(`======================\nERROR CREATING PAGE:\n----------------------\n`);
        error(err);
        error(
          `\n----------------------\nThe above error was encountered while creating the page for ${originalPath}\n======================\n`,
        );
      }
    }
  });

  // process images
  Object.entries(imageMap).forEach(([originalPath, { src: outputPath }]) => {
    processImage({ originalPath, outputPath });
  });
}

module.exports = generateContent;
