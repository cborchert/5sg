const fs = require("fs");
const path = require("path");
const process = require("process");

const generateContent = require("./generateContent.js");

process.on("exit", (code) =>
  console.log("Process exit event with code: ", code)
);

// remove the previous build
try {
  console.log(`Removing previous build...`);
  fs.rmdirSync("./build/", { recursive: true });
  console.log(`Previous build deleted.`);
} catch (err) {
  console.error(`Error while deleting previous build.`);
  console.error(err);
}

generateContent(({ outputPath, pageContent, onSuccess }) => {
  const finalPath = "./build/" + outputPath;
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
    onSuccess(finalPath);
  });
});
