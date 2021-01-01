/**
 * Generates the shell for a single page's html
 * @param {Object} param0
 * @param {string} param0.head
 * @param {object} param0.css
 * @param {string} param0.html
 */
function generateHtml({ head, css, html }) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${head}
        <style>
            ${css ? css.code : ""}
        </style>
    </head>
    <body>
        ${html}
    </body>
    </html>
    `;
}

module.exports = generateHtml;
