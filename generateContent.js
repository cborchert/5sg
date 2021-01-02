const process = require("process");
const fs = require("fs");
const path = require("path");

// Handle arguments
const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => argument.split("="))
);

const RENDER_DRAFTS = !!args.RENDER_DRAFTS;

///////////////
// Reporting //
///////////////

// OUTPUT_LEVEL determines what is logged to the terminal during the build
// 0 === none
// 1 === errors only
// 2 === all
// default value of 1
const OUTPUT_LEVEL = args.OUTPUT_LEVEL ? Number(args.OUTPUT_LEVEL) : 1;
const error = OUTPUT_LEVEL > 0 ? console.error : () => {};
const log = OUTPUT_LEVEL >= 2 ? console.log : () => {};

console.log("Generating content...");

// allows us to import svelte files directly in node without transpilation / bundling
require("svelte/register");

// import local utils
const generateHtml = require("./utils/generateHtml");
const getFiles = require("./utils/getFiles.js");
const processor = require("./utils/processor.js");

// load the Svelte template component used to create a page
const Template = require("./frontend/templates/Page.svelte").default;

/**
 *
 * @param {Function} handleContent
 */
async function generateContent(handleContent) {
  // for each md and each svelte file in ./content create a page
  const contentFiles = getFiles("./content", ["md", "svelte"]);
  console.log(`Content nodes found: ${contentFiles.length}`);
  console.log(`Building html for nodes...`);
  contentFiles.forEach((file) => {
    try {
      // get the path for the page
      // e.g. ./content/path/to/myPage.md => ./build/path/to/myPage.html
      let outputPath =
        file
          .replace(/^\.\/content\//, "")
          .replace(/\.[^\.]*$/, "")
          .replace(/[^A-Za-z0-9\_\-\/\.]/g, "")
          .toLowerCase() + ".html";

      let pageContent = "";
      let publishContent = true;

      const fileExtension = path.extname(file);

      if (fileExtension === ".md") {
        // handle markdown

        // convert the file's text into html
        const content = fs.readFileSync(file);
        const processed = processor.processSync(content);
        const { contents: htmlContent, data = {} } = processed;

        // allow for unpublished drafts
        const isDraft = !!(data.frontmatter && data.frontmatter.draft);
        publishContent = !isDraft || RENDER_DRAFTS;

        // allow for custom path, properly formatted
        const frontmatterPath =
          data.frontmatter && data.frontmatter.path
            ? data.frontmatter.path
                .replace(/^\.?\//, "")
                .replace(/\.[^\.]*$/, "")
                .replace(/[^A-Za-z0-9\_\-\/\.]/g, "")
                .toLowerCase() + ".html"
            : "";
        if (frontmatterPath) outputPath = frontmatterPath;

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
      } else if (fileExtension === ".svelte") {
        // only generate publishable content
        if (publishContent) {
          // handle svelte
          // import the svelte file and render it
          const Page = require(file).default;
          const { html, css, head } = Page.render();

          // inject the rendered component into the html shell template
          pageContent = generateHtml({ html, css, head });
        }
      }

      // only publish publishable content
      if (publishContent) {
        handleContent({
          outputPath,
          pageContent,
          onSuccess: (finalPath) => {
            log(`Created the page for ${file} at ${finalPath}`);
          },
        });
      }
    } catch (err) {
      error(
        `======================\nERROR CREATING PAGE:\n----------------------\n`
      );
      error(err);
      error(
        `\n----------------------\nThe above error was encountered while creating the page for ${file}\n======================\n`
      );
    }
  });
}

module.exports = generateContent;
