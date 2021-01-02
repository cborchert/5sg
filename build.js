const process = require("process");

// Handle arguments
const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => argument.split("="))
);

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

const startTime = new Date();

/**
 * Tells the user what happened
 * @param {number} code the exit code
 */
function report(code) {
  const timeDiff = new Date() - startTime;
  console.log(
    `Built ${successfulBuilds} file${
      successfulBuilds === 1 ? "" : "s"
    } in ${timeDiff}ms with ${unsuccessfulBuilds} error${
      unsuccessfulBuilds === 1 ? "" : "s"
    }`
  );
  console.log(`Built files available in ${path.resolve("./build")}/`);
  console.log("Process exit event with code: ", code);
}

console.log("Starting build...");
let successfulBuilds = 0;
let unsuccessfulBuilds = 0;
process.on("exit", report);

///////////
// Build //
///////////

// allows us to import svelte files directly in node without transpilation / bundling
require("svelte/register");
const fs = require("fs");
const path = require("path");

// import local utils
const generateHtml = require("./utils/generateHtml");
const getFiles = require("./utils/getFiles.js");
const processor = require("./utils/processor.js");

// load the Svelte template component used to create a page
const Template = require("./frontend/templates/Page.svelte").default;

// remove the previous build
try {
  console.log(`Removing previous build...`);
  fs.rmdirSync("./build/", { recursive: true });
  console.log(`Previous build deleted.`);
} catch (err) {
  console.error(`Error while deleting previous build.`);
}

// for each md and each svelte file in ./content create a page
const contentFiles = getFiles("./content", ["md", "svelte"]);
contentFiles.forEach((file) => {
  try {
    // get the path for the page
    // e.g. ./content/path/to/myPage.md => ./build/path/to/myPage.html
    const outputPath =
      "./build/" +
      file
        .replace(/^\.\/content\//, "")
        .replace(/\.[^\.]*$/, "")
        .toLowerCase() +
      ".html";

    let pageContent = "";

    const fileExtension = path.extname(file);

    if (fileExtension === ".md") {
      // handle markdown

      // convert the file's text into html
      const content = fs.readFileSync(file);
      const processed = processor.processSync(content);
      const { contents: htmlContent, data } = processed;

      // inject the data and html into the template
      const { html, css, head } = Template.render({
        htmlContent,
        data,
      });
      pageContent = generateHtml({ html, css, head });
    } else if (fileExtension === ".svelte") {
      // handle svelte
      // import the svelte file and render it
      const Page = require(file).default;
      const { html, css, head } = Page.render();

      // inject the rendered component into the html shell template
      pageContent = generateHtml({ html, css, head });
    }

    // create directory if necessary
    const outputDirectory = path.dirname(outputPath);
    if (!fs.existsSync(outputDirectory)) {
      fs.mkdirSync(outputDirectory, { recursive: true }, (err) => {
        // errors will be caught below
        throw err;
      });
    }

    // write content to file
    fs.writeFile(outputPath, pageContent, (err) => {
      // errors will be caught below
      if (err) throw err;
      log(`Created the page for ${file} at ${outputPath}`);
      successfulBuilds += 1;
    });
  } catch (err) {
    error(
      `======================\nERROR CREATING PAGE:\n----------------------\n`
    );
    error(err);
    error(
      `\n----------------------\nThe above error was encountered while creating the page for ${file}\n======================\n`
    );
    unsuccessfulBuilds += 1;
  }
});
