const fs = require("fs-extra");
const path = require("path");
const process = require("process");
const rimraf = require("rimraf");
const sharp = require("sharp");

const generateContent = require("./utils/generateContent.js");

const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => argument.split("="))
);
const isDev = !!args.DEV;
const PORT = 3000;

process.on("exit", (code) =>
  console.log("Process exit event with code: ", code)
);

// remove the previous build and then copy the static files over
try {
  console.log(`Removing previous build...`);
  rimraf.sync("./build/");
  console.log(`Previous build deleted.`);
  console.log(`Copying static folder to build...`);
  fs.copySync("./static", "./build/static");
  console.log(`Copied.`);
} catch (err) {
  console.error(`Error while deleting previous build.`);
  console.error(err);
}
/**
 * Write given content to build path
 */
const writeFinalContent = ({ outputPath = "", pageContent, onSuccess }) => {
  const finalPath = `./build/${outputPath.replace(/^\//, "")}`;

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
    const logPath = isDev
      ? `http://localhost:${PORT}/${outputPath.replace(/^\//, "")}`
      : finalPath;
    onSuccess(logPath);
  });
};

/**
 * given an original image, write to the output path
 */
const processImage = ({ originalPath, outputPath = "" }) => {
  console.log(outputPath);
  const finalPath = `./build/${outputPath.replace(/^\//, "")}`;

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
        .resize(1200, 800, { fit: "inside" })
        .toFile(finalPath)
        .catch((err) => {
          if (err) {
            console.error(`Error while processing ${originalPath}.`);
            console.error(err);
          }
        });

      // TODO: make small 10x10 jpg for blur up
    }
  } else {
    console.error(`Error while processing ${originalPath}. Cannot find file.`);
  }
};

generateContent(writeFinalContent, processImage);

// If the dev flag was given,
if (isDev) {
  // init server
  const express = require("express");
  const app = express();

  app.use(express.static("build"));

  app.listen(PORT, () => {
    console.log(
      `Dev server started, serving static build at http://localhost:${PORT}`
    );
  });
}
