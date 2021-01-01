const path = require("path");
const fs = require("fs");

/**
 * Recursively gets all matching files in a directory
 * @param {string} inDir
 * @param {string} ext
 */
function getFiles(inDir, ext) {
  let files = [];
  if (!ext) return files;
  fs.readdirSync(inDir).forEach((file) => {
    console.log(file);
    const absPath = path.join(inDir, file);
    if (fs.statSync(absPath).isDirectory()) {
      // if the given "file" is a directory, get its files and add them to the list
      files = [...files, ...getFiles(absPath, ext)];
    } else if (
      absPath &&
      absPath.toLocaleLowerCase().endsWith(`.${ext.toLowerCase()}`)
    ) {
      // if the given "file" is a file, and it matches the extension, then add it to the list
      // TODO: allow for several ext
      // TODO: Match using regex
      files = [...files, absPath];
    }
  });
  return files;
}

module.exports = getFiles;
