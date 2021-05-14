/**
 * Generates the html file content
 * @param {Object} param0
 * @param {?string} param0.head
 * @param {?string} param0.styles
 * @param {?string} param0.html
 * @returns {string} the final html
 */
export default function generateHtmlFileContent({ head = '', styles = '', html = '' }) {
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
