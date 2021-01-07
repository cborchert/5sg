const path = require('path');
const fs = require('fs');

/**
 * Recursively gets all matching files in a directory
 * @param {string} inDir the directory to recursively search
 * @param {array} extensions an array of strings representing the file extensions to accept written in lower case ["md", "svelte"]
 */
function getFiles(inDir, extensions) {
  let files = [];
  if (!extensions) return files;
  fs.readdirSync(inDir).forEach((file) => {
    const absPath = path.join(inDir, file);
    const fileExtension = path.extname(file).toLowerCase().replace('.', '');
    if (fs.statSync(absPath).isDirectory()) {
      // if the given "file" is a directory, get its files and add them to the list
      files = [...files, ...getFiles(absPath, extensions)];
    } else if (absPath && extensions && extensions.includes(fileExtension)) {
      // if the given "file" is a file, and it matches the extension, then add it to the list
      files = [...files, absPath];
    }
  });
  return files;
}

module.exports = getFiles;
