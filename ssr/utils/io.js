// @ts-check

const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const sharp = require('sharp');
const imageSize = require('image-size').default;

const { IS_DEV, PORT, BUILD_DIR, BASE_DIR, STATIC_DIR, BUILD_STATIC_DIR } = require('./constants.js');
const { log, error, forceLog, forceError } = require('./reporting.js');
const { REGEX_LEADING_SLASH, REGEX_EXTENSION } = require('./regex.js');

/**
 * Delete remove files in the designated build directory
 */
function deletePreviousBuild() {
  try {
    forceLog(`Removing previous build...`);
    rimraf.sync(BUILD_DIR);
    forceLog(`Previous build deleted.`);
  } catch (err) {
    forceError(`Error while deleting previous build.`);
    forceError(err);
  }
  try {
    /** @todo eventually we'll want to keep the cache, but we don't have the mechanics in place for that yet */
    forceLog(`Removing previous cache...`);
    rimraf.sync(path.join(BASE_DIR, '/.5sg'));
    forceLog(`Previous cache deleted.`);
  } catch (err) {
    forceError(`Error while deleting cache build.`);
    forceError(err);
  }
}

/**
 * Copy designated static directory to build directory
 */
function copyStaticFiles() {
  try {
    forceLog(`Copying static files to build...`);
    fs.copySync(STATIC_DIR, BUILD_STATIC_DIR);
    forceLog(`Copied.`);
  } catch (err) {
    forceError(`Error copying static files`);
    forceError(err);
  }
}

/**
 * @callback writeLogger
 * @param {string} logPath if the content is served, the served path; otherwise the finalPath
 * @param {string} finalPath the write path of the file
 * @returns {any}
 */

/**
 * Write given content to output path
 *
 * @param {Object} param0 the params
 * @param {string|Buffer} param0.fileContent the content to write
 * @param {string=} param0.outputBase the directory to write to defaults to the build directory
 * @param {string} param0.outputPath the path of the file to write to, relative to the outputBase
 * @param {boolean=} param0.skipIfExists if true will not overwrite existing files
 * @param {writeLogger=} param0.onSuccess the success callback
 * @param {writeLogger=} param0.onSkip the skip callback
 * @throws on I/O error
 */
const writeContentToPath = ({
  fileContent,
  outputPath = '',
  onSuccess = () => {},
  skipIfExists = false,
  onSkip = () => {},
  outputBase = BUILD_DIR,
}) => {
  const finalPath = outputBase ? path.join(outputBase, outputPath.replace(REGEX_LEADING_SLASH, '')) : outputPath;
  const logPath = IS_DEV ? `http://localhost:${PORT}/${outputPath.replace(REGEX_LEADING_SLASH, '')}` : finalPath;

  // create directory if necessary
  const outputDirectory = path.dirname(finalPath);
  if (!fs.existsSync(outputDirectory)) {
    // errors will be caught by parent
    fs.mkdirSync(outputDirectory, { recursive: true });
  }

  if (fs.existsSync(finalPath) && skipIfExists) {
    // handle skip
    onSkip(logPath, finalPath);
  } else {
    // write content to file
    fs.writeFile(finalPath, fileContent, (err) => {
      // errors will be caught by caller
      if (err) throw err;
      // handle success
      onSuccess(logPath, finalPath);
    });
  }
};

/**
 * Given an original image, write to the output path
 *
 * @param {Object} param0 the props
 * @param {string} param0.originalPath the path to the image
 * @param {string} param0.outputPath the path to write to
 */
const processImage = ({ originalPath, outputPath = '' }) => {
  log(`Processing image ${originalPath}`);

  if (!fs.existsSync(originalPath)) {
    error(`Error while processing ${originalPath} : cannot find file.`);
    return;
  }

  sharp(originalPath)
    .resize(2000, 1200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer((err, buffer) => {
      /** @todo consider using toFile here directly @see https://sharp.pixelplumbing.com/api-output#tofile */
      if (err) {
        error(`Error while processing ${originalPath}.`);
        error(err);
        return;
      }
      try {
        writeContentToPath({
          fileContent: buffer,
          outputPath,
          // do not overwrite -- it's a worthless operation
          skipIfExists: true,
          onSuccess: (logPath) => {
            log(`Image processing for ${originalPath} completed. Processed image: ${logPath}`);
          },
          onSkip: (logPath) => {
            log(`Image processing for ${originalPath} skipped. Processed image exists at: ${logPath}`);
          },
        });
      } catch (ioError) {
        error(`Error while writing image file for ${originalPath} to ${outputPath}`);
        error(ioError);
      }
    });

  /** make small 10x10 jpg for blur up */
  sharp(originalPath)
    .resize(10, 10, { fit: 'inside', withoutEnlargement: true })
    .toBuffer((err, buffer) => {
      /** @todo consider using toFile here directly @see https://sharp.pixelplumbing.com/api-output#tofile */
      if (err) {
        error(`Error while processing ${originalPath}.`);
        error(err);
        return;
      }
      const extension = outputPath.match(REGEX_EXTENSION)[0];
      const blurSrc = outputPath.replace(REGEX_EXTENSION, `__tiny${extension}`);
      try {
        writeContentToPath({
          fileContent: buffer,
          outputPath: blurSrc,
          // do not overwrite -- it's a worthless operation
          skipIfExists: true,
          onSuccess: (logPath) => {
            log(`Image processing for ${originalPath} completed. Processed image: ${logPath}`);
          },
          onSkip: (logPath) => {
            log(`Image processing for ${originalPath} skipped. Processed image exists at: ${logPath}`);
          },
        });
      } catch (ioError) {
        error(`Error while writing image file for ${originalPath} to ${outputPath}`);
        error(ioError);
      }
    });

  /** @todo possibly write a webp image for modern browsers */
};

/**
 * Get the image's dimensions
 *
 * @param {string} originalPath the path to the image
 * @returns {{width: number, height: number}} the image meta
 */
const getImageInfo = (originalPath) => {
  if (!fs.existsSync(originalPath)) {
    error(`Error while processing ${originalPath} : cannot find file.`);
    return;
  }
  return imageSize(originalPath);
};

/**
 * Recursively gets all matching files in a directory
 *
 * @param {string} inDir the directory to recursively search
 * @param {Array} extensions an array of strings representing the file extensions to accept written in lower case ["md", "svelte"]
 * @returns {string[]} the file paths
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

module.exports = {
  deletePreviousBuild,
  copyStaticFiles,
  writeContentToPath,
  processImage,
  getFiles,
  getImageInfo,
};
