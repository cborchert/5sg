const remark = require("remark");
const find = require("unist-util-find");
const visit = require("unist-util-visit");
const filter = require("unist-util-filter");
const path = require("path");

const EXTRACT_LIMIT = 250;

/**
 * A remark plugin to extract the title and description from the frontmatter or content of a markdown file
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const extractSeo = () => (tree = {}, file = {}) => {
  const { data = {} } = file;

  // init seo node in data
  data.seo = {};

  // extract title
  if (data.frontmatter && data.frontmatter.title) {
    // use specified title from front matter
    data.seo.title = data.frontmatter.title;
  } else {
    // extract title from first heading
    const firstHeading = find(tree, { type: "heading" });
    let titleText = "";
    visit(firstHeading, "text", (node) => {
      titleText += node.value + " ";
    });
    // remove double spaces and terminal space
    titleText = titleText.replace(/\s\s+/, " ").replace(/\s$/, "");
    data.seo.title = titleText;
  }

  // extract excerpt / description
  if (data.frontmatter && data.frontmatter.description) {
    // use specified description from front matter
    data.seo.description = data.frontmatter.description;
  } else if (data.frontmatter && data.frontmatter.excerpt) {
    // use specified excerpt from front matter
    data.seo.description = data.frontmatter.excerpt;
  } else {
    // extract description from non heading text nodes
    let descriptionText = "";
    visit(
      filter(tree, (node) => node.type !== "heading" && node.type !== "yaml"),
      "text",
      (node) => {
        descriptionText += node.value + " ";
      }
    );

    // remove double spaces and terminal space
    descriptionText = descriptionText.replace(/\s\s+/, " ").replace(/\s$/, "");
    if (descriptionText.length > EXTRACT_LIMIT) {
      // remove final characters and then add ellipses
      descriptionText =
        descriptionText.substr(0, EXTRACT_LIMIT).replace(/[^A-Za-z0-9]+$/, "") +
        "...";
    }
    data.seo.description = descriptionText;
  }
};

/**
 * A remark plugin replace relative links with absolute links
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const replaceRelativeLinks = () => (tree = {}, file = {}) => {
  // get relative path of file
  // (assuming we've set the cwd and path correctly in the generateContent)
  const { cwd, path: filePath, dirname } = file;
  if (!cwd || !filePath || !dirname || cwd === path) {
    file.fail(
      `Path or cwd of processed file incorrectly set, got: ${JSON.stringify({
        cwd,
        path: filePath,
        dirname,
      })}`
    );
    return;
  }

  // get relative path
  const relDirname = dirname.replace(cwd, "");

  visit(tree, "link", (node) => {
    // replace links relative to the file with links relative to the content path
    if ((node.url && node.url.startsWith("./")) || node.url.startsWith("../"))
      node.url = path.join(relDirname, node.url);
  });
};

// create a processor which will be used to parse or process a valid markdown string or file
const processor = remark()
  .use(require("remark-frontmatter"))
  .use(require("remark-parse-frontmatter"))
  .use(extractSeo)
  .use(require("remark-html"))
  .freeze();

module.exports = processor;
