const fs = require('fs-extra');
const path = require('path');
const process = require('process');
const rimraf = require('rimraf');
const sharp = require('sharp');

const { IS_DEV, PORT, BUILD_DIR, STATIC_DIR, BUILD_STATIC_DIR } = require('./ssr/constants');
const { log, error, forceLog, forceError } = require('./ssr/util/reporting.js');

const generateContent = require('./ssr/generateContent.js');

process.on('exit', (code) => forceLog('Process exit event with code: ', code));

// remove the previous build and then copy the static files over
try {
  forceLog(`Removing previous build...`);
  rimraf.sync(BUILD_DIR);
  forceLog(`Previous build deleted.`);
  forceLog(`Copying static folder to build...`);
  fs.copySync(STATIC_DIR, BUILD_STATIC_DIR);
  forceLog(`Copied.`);
} catch (err) {
  forceError(`Error while deleting previous build.`);
  forceError(err);
}
/**
 * Write given content to build path
 */
const writeFinalContent = ({ outputPath = '', pageContent, onSuccess }) => {
  const finalPath = path.join(BUILD_DIR, outputPath.replace(/^\//, ''));

  // create directory if necessary
  const outputDirectory = path.dirname(finalPath);
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true }, (err) => {
      // errors will be caught below
      throw err;
    });
  }

  // write content to file
  fs.writeFile(finalPath, pageContent, (err) => {
    // errors will be caught below
    if (err) throw err;

    // log message
    const logPath = IS_DEV ? `http://localhost:${PORT}/${outputPath.replace(/^\//, '')}` : finalPath;
    onSuccess(logPath);
  });
};

/**
 * given an original image, write to the output path
 */
const processImage = ({ originalPath, outputPath = '' }) => {
  log(`Processing image ${originalPath}`);
  const finalPath = path.join(BUILD_DIR, outputPath.replace(/^\//, ''));

  // create directory if necessary
  const outputDirectory = path.dirname(finalPath);
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory, { recursive: true }, (err) => {
      // errors will be caught below
      throw err;
    });
  }

  if (fs.existsSync(originalPath)) {
    // don't try to copy images that don't exist
    if (!fs.existsSync(finalPath)) {
      // do not overwrite -- it's a worthless operation
      sharp(originalPath)
        .resize(1200, 800, { fit: 'inside' })
        .toFile(finalPath)
        .catch((err) => {
          if (err) {
            error(`Error while processing ${originalPath}.`);
            error(err);
          }
        });

      // TODO: make small 10x10 jpg for blur up

      log(`Image processing for ${originalPath} completed. Processed image: ${finalPath}`);
    } else {
      log(`Image processing for ${originalPath} skipped. Processed image exists at ${finalPath}`);
    }
  } else {
    error(`Error while processing ${originalPath}. Cannot find file.`);
  }
};

generateContent(writeFinalContent, processImage);

// If the dev flag was given,
if (IS_DEV) {
  // init server
  // eslint-disable-next-line global-require
  const express = require('express');
  const app = express();

  app.use(express.static('build'));

  app.listen(PORT, () => {
    log(`Dev server started, serving static build at http://localhost:${PORT}`);
  });
}
