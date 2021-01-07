/**
 * Generates the shell for a single page's html
 * @param {Object} param0
 * @param {string} param0.head the rendered css
 * @param {string} param0.styles the rendered css string
 * @param {string} param0.html the rendered html
 */
function generateOuterHtml({ head = '', styles = '', html = '' }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${head}
        <style>
            ${styles}
        </style>
    </head>
    <body>
        ${html}
    </body>
    </html>
    `;
}

module.exports = generateOuterHtml;
