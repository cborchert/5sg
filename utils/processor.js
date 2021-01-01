const remark = require("remark");

// create a processor which will be used to parse or process a valid markdown string or file
const processor = remark()
  .use(require("remark-frontmatter"))
  // TODO: for frontmatter -- make sure to handle errors for files without frontmatter
  //   .use(require("remark-parse-frontmatter"))
  .use(require("remark-html"))
  .freeze();

module.exports = processor;
