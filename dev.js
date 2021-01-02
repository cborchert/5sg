const generateContent = require("./generateContent.js");

// init server
const PORT = 3000;
const app = require("express")();

generateContent(({ outputPath, pageContent, onSuccess }) => {
  const finalPath = "/" + outputPath;
  // create the route
  app.get(finalPath, async function (req, res) {
    res.send(pageContent);
  });

  // handle /my/path/to/index.html cases
  if (finalPath.endsWith("/index.html")) {
    const nonIndexPath = finalPath.replace(/\/index\.html$/, "/");
    app.get(nonIndexPath, async function (req, res) {
      res.send(pageContent);
    });
  }

  onSuccess(`http://localhost:${PORT}${finalPath}`);
});

app.listen(PORT, () => {
  console.log(`Dev server started at http://localhost:${PORT}`);
});
