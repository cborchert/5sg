// allows us to import svelte files directly in node without transpilation / bundling
require("svelte/register");
const fs = require("fs");

// import local utils
const generateHtml = require("./utils/generateHtml");
const getFiles = require("./utils/getFiles.js");
const processor = require("./utils/processor.js");

// load the Svelte template component used to create a page
const Template = require("./frontend/templates/Page.svelte").default;

// init server
const PORT = 3000;
const app = require("express")();

// for each file create a page
const contentFiles = getFiles("./content", "md");
contentFiles.forEach((file) => {
  try {
    console.log(file);
    // get the path for the page
    // e.g. /content/path/to/myPage.md => /path/to/myPage
    const pagePath = file.replace(/^content\//, "/").replace(/\.md$/, "");

    // convert the file's text into html
    const content = fs.readFileSync(file);
    const processed = processor.processSync(content);
    const { contents: htmlContent, data } = processed;

    // inject the data and html into the template
    const { html, css, head } = Template.render({
      htmlContent,
      data,
    });

    // create the route
    app.get(pagePath, async function (req, res) {
      res.send(generateHtml({ html, css, head }));
    });

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
