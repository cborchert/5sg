const fs = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');
const sharp = require('sharp');

const { IS_DEV, PORT, BUILD_DIR, STATIC_DIR, BUILD_STATIC_DIR } = require('../constants.js');
const { log, error, forceLog, forceError } = require('./reporting.js');

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
 * Write given content to output path
 * @param {Object} param0
 * @param {string} param0.pageContent the content to write
 * @param {string} param0.outputPath the path to write to
 * @param {boolean} param0.skipIfExists if true will not overwrite existing files
 * @param {(logPath: string, finalPath: string)} param0.onSuccess the success callback
 * @param {(logPath: string, finalPath: string)} param0.onSkip the skip callback
 * @throws on I/O error
 */
const writeContentToPath = ({ fileContent, outputPath = '', onSuccess, skipIfExists, onSkip }) => {
  const finalPath = path.join(BUILD_DIR, outputPath.replace(/^\//, ''));
  const logPath = IS_DEV ? `http://localhost:${PORT}/${outputPath.replace(/^\//, '')}` : finalPath;

  // create directory if necessary
  const outputDirectory = path.dirname(finalPath);
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true }, (err) => {
      // errors will be caught below
      throw err;
    });
  }

  if (fs.existsSync(finalPath) && skipIfExists) {
    // handle skip
    onSkip(logPath, finalPath);
  } else {
    // write content to file
    fs.writeFile(finalPath, fileContent, (err) => {
      // errors will be caught below
      if (err) throw err;

      // handle success
      onSuccess(logPath, finalPath);
    });
  }
};

/**
 * given an original image, write to the output path
 * @param {Object} param0
 * @param {string} originalPath the path to the image
 * @param {string} outputPath the path to write to
 */
const processImage = ({ originalPath, outputPath = '' }) => {
  log(`Processing image ${originalPath}`);

  if (!fs.existsSync(originalPath)) {
    error(`Error while processing ${originalPath} : cannot find file.`);
    return;
  }

  sharp(originalPath)
    .resize(1200, 800, { fit: 'inside' })
    .toBuffer((err, buffer) => {
      // TODO: use third info parameter to deal with file info (for use such as width, height, etc. )
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

  // TODO: possibly write a webp image for modern browsers
  // TODO: make small 10x10 jpg for blur up
};

module.exports = {
  deletePreviousBuild,
  copyStaticFiles,
  writeContentToPath,
  processImage,
};
