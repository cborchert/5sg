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

// init server
const PORT = 3000;
const app = require("express")();

// for each md and each svelte file in ./content create a page
const contentFiles = getFiles("./content", ["md", "svelte"]);
contentFiles.forEach((file) => {
  try {
    // get the path for the page
    // e.g. /content/path/to/myPage.md => /path/to/myPage.html
    const pagePath =
      file
        .replace(/^\.\/content\//, "/")
        .replace(/\.[^\.]*$/, "")
        .toLowerCase() + ".html";

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

      // inject  the rendered component inot the html shell template
      pageContent = generateHtml({ html, css, head });
    }

    // create the route
    app.get(pagePath, async function (req, res) {
      res.send(pageContent);
    });

    // handle /my/path/to/index.html cases
    if (pagePath.endsWith("/index.html")) {
      const nonIndexPath = pagePath.replace(/\/index\.html$/, "/");
      app.get(nonIndexPath, async function (req, res) {
        res.send(pageContent);
      });
    }

    console.log(
      `Created the page for ${file} at http://localhost:${PORT}${pagePath}`
    );
  } catch (e) {
    console.log(
      `======================\nERROR CREATING PAGE:\n----------------------\n`
    );
    console.error(e);
    console.log(
      `\n----------------------\nThe above error was encountered while creating the page for ${file}\n======================\n`
    );
  }
});

app.listen(PORT, () => {
  console.log(`Dev server started at http://localhost:${PORT}`);
});
