const remark = require("remark");

// create a processor which will be used to parse or process a valid markdown string or file
const processor = remark()
  .use(require("remark-frontmatter"))
  .use(require("remark-parse-frontmatter"))
  .use(require("remark-html"))
  .use(console.dir)
  .freeze();

module.exports = processor;
