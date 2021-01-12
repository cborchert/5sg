const process = require('process');

const { IS_DEV, PORT } = require('./ssr/utils/constants.js');
const { deletePreviousBuild, copyStaticFiles } = require('./ssr/utils/io.js');
const { log, forceLog } = require('./ssr/utils/reporting.js');
const generateContent = require('./ssr/generateContent.js');

// on exit give an update
process.on('exit', (code) => forceLog('Process exit event with code: ', code));

// prep build
deletePreviousBuild();
copyStaticFiles();
// make the html files for the content present in /content
generateContent();

// If the dev flag was given, init an express static server
if (IS_DEV) {
  // eslint-disable-next-line global-require
  const express = require('express');
  const app = express();

  app.use(express.static('dist'));

  // Redirect to a 404 page as a fallback (on errors)
  app.use((req, res) => {
    res.redirect('/404.html');
  });

  app.listen(PORT, () => {
    log(`Dev server started, serving static build at http://localhost:${PORT}`);
  });
}
