const unified = require("unified");
const visit = require("unist-util-visit");
const path = require("path");

/**
 * A rehype plugin to replace relative links with absolute links
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const replaceRelativeLinks = () => (tree = {}, file = {}) => {
  // get relative path of file
  // (assuming we've set the cwd and path correctly in the generateContent)
  const { cwd, path: filePath, dirname, nodeMap = {} } = file;
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

  visit(tree, { tagName: "a" }, ({ properties }) => {
    let { href } = properties;

    // replace relative urls with urls beginning with a /
    // e.g. ../index.md in content/sub/sub2/test.md becomes /sub/index.md
    // e.g. ./index.md in content/sub/sub2/test.md becomes /sub/sub2/index.md
    if (properties.href && /^\.?\.\//.test(properties.href))
      href = path.join(relDirname, properties.href);

    // if the url exists in the map, use final url from the map
    if (nodeMap[href]) href = nodeMap[href];

    // update the url
    if (href !== properties.href) properties.href = href;
  });
};

/**
 * A rehype plugin to replace image links with correct image links, and to add them to the nodeMap for processing
 * see https://unifiedjs.com/learn/guide/create-a-plugin/
 */
const replaceImageLinks = () => (tree = {}, file = {}) => {
  // get relative path of file
  // (assuming we've set the cwd and path correctly in the generateContent)
  const { cwd, path: filePath, dirname, baseDir, imageMap = {} } = file;
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

  visit(tree, { tagName: "img" }, ({ properties }) => {
    let { src = "" } = properties;

    if (src.startsWith("/")) {
      // create image map for srcs from the base directory
      imageMap[path.join(baseDir, src)] = src;
    } else if (properties.src && /^\.?\.\//.test(properties.src)) {
      // deal with relative paths
      src = path.join(relDirname, properties.src);
      imageMap[path.join(cwd, src)] = src;
    }
    // update the url if necessary
    if (src !== properties.src) properties.src = src;
  });
};

// create a processor which will be used to parse or process a valid markdown string or file
const postProcessor = unified()
  // HTML to AST
  .use(require("rehype-parse"))
  // Replace relative links
  .use(replaceRelativeLinks)
  // Replace image links
  .use(replaceImageLinks)
  // back to HTML
  .use(require("rehype-stringify"))
  // TODO: minify the html (build only, this adds a few seconds to build time)
  // .use(require("rehype-preset-minify"))
  .freeze();

module.exports = postProcessor;
