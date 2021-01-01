const path = require("path");
const fs = require("fs");

/**
 * Recursively gets all matching files in a directory
 * @param {string} inDir the directory to recursively search
 * @param {array} ext an array of strings representing the file extensions to accept written in lower case ["md", "svelte"]
 */
function getFiles(inDir, ext) {
  let files = [];
  if (!ext) return files;
  fs.readdirSync(inDir).forEach((file) => {
    const absPath = `${inDir}/${file}`;
    const fileExtension = path.extname(file).toLowerCase().replace(".", "");
    if (fs.statSync(absPath).isDirectory()) {
      // if the given "file" is a directory, get its files and add them to the list
      files = [...files, ...getFiles(absPath, ext)];
    } else if (absPath && ext && ext.includes(fileExtension)) {
      // if the given "file" is a file, and it matches the extension, then add it to the list
      // TODO: allow for several ext
      // TODO: Match using regex ?
      // TODO: lowercase extension ?
      files = [...files, absPath];
    }
  });
  return files;
}

module.exports = getFiles;
