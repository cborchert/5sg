const fs = require("fs");
const path = require("path");
const process = require("process");
const rimraf = require("rimraf");

const generateContent = require("./generateContent.js");

const args = Object.fromEntries(
  process.argv.slice(2).map((argument) => argument.split("="))
);
const isDev = !!args.DEV;
const PORT = 3000;

process.on("exit", (code) =>
  console.log("Process exit event with code: ", code)
);

// remove the previous build
try {
  console.log(`Removing previous build...`);
  rimraf.sync("./build/");
  console.log(`Previous build deleted.`);
} catch (err) {
  console.error(`Error while deleting previous build.`);
  console.error(err);
}

generateContent(({ outputPath, pageContent, onSuccess }) => {
  const finalPath = `./build/${outputPath}`;

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
      ? `http://localhost:${PORT}/${outputPath}`
      : finalPath;
    onSuccess(logPath);
  });
});

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
