import fs from 'fs';
import path from 'path';

/**
 * recursively get all files in the directory
 * @param {string} dir
 * @returns {Array<string>} the absolute paths to the files
 */
export const getAllDirectoryFiles = (dir) => {
  const filePaths = [];
  fs.readdirSync(dir).forEach((item) => {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    if (stat.isFile()) {
      filePaths.push(path.resolve(itemPath));
    } else if (stat.isDirectory()) {
      filePaths.push(...getAllDirectoryFiles(itemPath));
    }
  });
  return filePaths;
};

/**
 * Creates a directory if it doesn't exist
 * @param {string} dir the directory to create
 */
export const createDir = (dir) => {
  if (!fs.existsSync(dir)) {
    // errors will be caught by parent
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Is dest newer than src ?
 * @param {string} src the source file path
 * @param {string} dest the destination file path
 * @returns {boolean} true if dest is newer than src
 */
export const isNewer = (dest, src) => {
  // no destination => destination is NOT newer
  if (!fs.existsSync(dest)) return false;
  // no source => destination IS newer (albeit in a twisted time travel kind of way)
  if (!fs.existsSync(src)) return true;

  // if both, return true if destination's ctime is later than source's
  const statSrc = fs.statSync(src);
  const statDest = fs.statSync(dest);
  return statDest.ctime > statSrc.ctime;
};

/**
 * Copy from src to dest if newer
 * @param {string} src the source file path
 * @param {string} dest the destination file path
 * @returns {Promise}
 */
export const copyIfNewer = (src, dest) => {
  return new Promise(async (resolve, reject) => {
    // do nothing if there's no src file
    if (!fs.existsSync(src)) return resolve();

    // create the directory if it doesn't exist
    const destDir = path.dirname(dest);
    createDir(destDir);

    // do nothing if destination is newer
    const destinationIsNewer = isNewer(dest, src);
    if (destinationIsNewer) return resolve();

    await fs.promises.copyFile(src, dest);
    return resolve();
  });
};
