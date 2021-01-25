// this file is just useful for typedefs

/**
 * @typedef {Object} ContentData
 * @property  {string} initialPath the initial path of the file e.g. /Users/chris/5sg/content/blog/post   1.md
 * @property  {string} relPath e.g. blog/post   1.md
 * @property  {string} fileName e.g. post   1.md
 * @property  {string} finalPath the relative to the output file of the final rendered content e.g. blog/post1.html OR e.g. designated-slug.html
 * @property  {string} modified the modified date
 * @property  {string} created the created date
 * @property  {boolean} draft is the content a draft?
 * @property  {string} template The name of the template to use to render, e.g. if "MyTemp", we'll use src/client/templates/MyTemp.svelte
 * @property  {Object=} frontmatter  the (optional) frontmatter content extracted from an md file
 */

/**
 * @typedef {Object} ContentNode
 * @property {ContentData} data the data of the content
 * @property {string} contents processed html
 * @property {*} Component the svelte component used for rendering
 */

module.exports = {};
