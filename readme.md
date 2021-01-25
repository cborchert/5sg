# Stupid Simple Svelte Static Site Generator (5SG)

<a name="in-the-works"></a>
NOTE: This project is still what I'd consider a proof of concept. Things may change, or I might abandon the poor thing. I wouldn't depend on it for anything at this point. You've been warned.

ALSO NOTE: Even these docs are a work in progress. 🤷

## Introduction

_5sg_ stands for **s**tupid **s**imple **s**velte **s**tatic **s**ite **g**enerator. It's a static site generator (SSG) in the making which focuses on ease of development, simplicity of structure, and speed of delivery. It takes in markdown and svelte, and outputs html. The name will probably change.

It works like this:

1. You put your content in the `/content` directory as `.md` files or `.svelte` files
2. You modify the template files (`.svelte`) in `/src/client/templates` to suit your design
3. You build using `yarn build` or launch a dev server using `yarn dev`.

That's it. Your static site is ready to publish. 🤯

## Getting started

- Download the code or clone the repo: `git clone https://github.com/cborchert/5sg.git && cd 5sg`
- Install the dependencies by running `yarn` or `npm install`

### Dev server

- Run `yarn dev` or `npm run dev`
- Visit [http://localhost:3000/](http://localhost:3000/)

The project is built into `/dist`, and an express server is launched to serve the files. We listen to changes and rebuild. Note that this is still REAAAAALLY basic -- there's no hot module reloading, or incremental builds. That means the _entire_ site will rebuild and you'll need to refresh manually. See the [note](#in-the-works) above.

`yarn dev:quiet` will do the same thing with less output to the terminal

`yarn dev:explicit` will do the same thing with more output to the terminal

### Static build

- Run `yarn build` or `npm run build`
- Check the `./dist` directory 🕵️‍♀️

The project is built into `/dist`.

`yarn build:quiet` will do the same thing with less output to the terminal

`yarn build:explicit` will do the same thing with more output to the terminal

### Building on Netlify

- Upload your code to github, gitlab, or bitbucket
- Open your [netlify](https://app.netlify.com/) account
- Click "[new site from git](https://app.netlify.com/start)"
- Select your repo
- Ensure that the build command is `npm run build` (default) and that the publish directory is `dist/` (also default)
- Click deploy site
- The site is live (✨)

## How it works

1. We look content in the form of `.md` and `.svelte` files in `/content`.
1. We process the content, and collect meta data into an array of `nodeData` where one node represents one published page
   1. `.md` are transformed into html using remark, and their frontmatter is extracted
   1. meta data for `.svelte` files is extracted
   1. ~~(ONE DAY: MDSvex `.svx` filles will be preprocessed using remark)~~
1. We optionally build dynamic pages using the meta data from the `.md` and `.svelte` files. Each dynamic page is added to the `nodeData` array for post processing.
1. The content in the `nodeData` array is post processed -- each node is saved as an `html` file in the `/dist` directory.
   1. content generated from markdown is injected into the designated template (or Default.svelte) and then transformed into html
   1. content from svelte content files and the dynamic pages is transformed into html using the svelte compiler
   1. all relative links and relative paths images are corrected
   1. unless a slug was designated, the output `html` file is generated with the same relative path as the input file. i.e. `/content/blog/2021/01/post.svelte` is published as `/dist/blog/2021/01/post.html`
1. All images used in html (except those in the `/static` folder) are processed
1. We copy the `/static` folder to `/dist/static`
1. A sitemap and sitemanifest are created and added to `/dist`

## Practical details

### Markdown Files

### The idea

Any `.md` file present in `/content` will generate a `.html` file in `/dist` with the same relative path (i.e. `/content/blog/2021/01/post.md` generates `/dist/blog/2021/01/post.html`), or with the designated slug. It will be wrapped in the designated template.

### Frontmatter

Frontmatter is a way of adding metadata to a markdown file which is not normally visible once published. In 5sg the must be valid yaml fenced off by three dashes at the beginning of the file. For example:

```md
---
title: Lorem Ipsum
description: This is just a test
template: MyTemplate
date: 2015-01-18
author: Dayton Hahn
tags:
  - dolor
  - sit
category: amet
cover: '/cover.jpg'
---

# Hello world

Your content here
```

All frontmatter is extracted and saved as metadata for later use by the template or dynamic pages

Certain frontmatter attributes are special:

- **template** Used to designate the template used to wrap the html content. e.g. `template: MyTemplate` will use `/src/client/templates`
- **permalink** || **path** || **route** || **slug** Used to designate the final path of the generated html. e.g. imagine `/content/myPage.md` has the frontmatter attribute `permalink: /path/to/myPage`; the path to its generated `html` file will be `/dist/path/to/myPage.html`

The following are used by the Default template:

- **title** injected into the `<title/>` of the html file
- **description** injected into the `<meta name="description" />` of the html file

## Templates

```html
<script>
  /** @todo write templates documentation */

  // Each svelte template receives the following props
  // the rendered content from the source
  export let htmlContent = '';
  // the data relative to this content
  export let data = {};
</script>
```

Also

```svelte
<script context="module">
  /**
   * Derives additional props from the node data
   *
   * @param {Object} param0
   * @param {Object} param0.nodeData the data relative to all nodes
   * @param {Object} param0.data the data relative to this content
   * @returns {Object} the additional props injected into the component
   */
  export const __5sg__deriveProps = ({ nodeData = {}, data = {} }) => {
    // these will be injected into the component
    return {
      postTitles:
        Object.values(nodeData).map(node) => node.frontmatter.title),
    };
  };
</script>

<script>
  // the rendered content from the source
  export let htmlContent = '';
  // the data relative to this content
  export let data = {};

  // injected by __5sg__deriveProps
  export let postTitles = [];
</script>
```

## Svelte files

`// TODO`

## nodeData

`// TODO`

```js
/**
 * the structure of a single node
 *
 * @typedef {Object} ContentNode
 * @property {ContentData} data the data of the content
 * @property {string} contents processed html
 * @property {*} Component the svelte component used for rendering
 */

/**
 * The data property of a single node
 *
 * @typedef {Object} ContentData
 * @property  {string} initialPath the initial path of the file e.g. /Users/chris/5sg/content/blog/post   1.md
 * @property  {string} relPath e.g. blog/post   1.md
 * @property  {string} fileName e.g. post   1.md
 * @property  {string} finalPath the relative to the output file of the final rendered content e.g. blog/post1.html OR e.g. designated-slug.html
 * @property  {string} modified the modified date
 * @property  {string} created the created date
 * @property  {boolean} draft is the content a draft?
 * @property  {string} template The name of the template to use to render, e.g. if "MyTemp", we'll use src/client/templates/MyTemp.svelte
 * @property  {{title: string, description: string}=} seo the (optiobal) seo content
 * @property  {Object=} frontmatter  the (optional) frontmatter content extracted from an md file
 */
```

## Dynamic pages

`// TODO`

## Post Processing

`// TODO`

## Relative links

`// TODO`

## Image processing

`// TODO`

## Config

`// TODO`

### What the 🤬!? My svelte components DON'T DO ANYTHING

Calm down. Breath. This is normal.

While partial hydration of specific svelte components is on the roadmap, svelte components are not hydrated by default (so click handlers and interactive bits won't work). This is intentional -- we want to make sure that we're not sending extra stuff to the front end since our goal is to respect the end user's data consumption as much as possible.

This means that by default all svelte files should be treated as PRESENTATIONAL components, or templates, if you will.

If a template file, or a svelte page file in the `/content` directory should be hydrated, you must export a `__5sg__hydrate` variable. Make sure to do so in a script tag with `context="module"` so that the export is readable :)

```svelte
<script context="module">
  // this page will be interactive 🌈
  export const __5sg__hydrate = true;
</script>
```

## Motivation

The goal of this project is to create a SSG which fulfills the following requirements:

1. It is easy for developers and content creators to create their sites using components and markdown.
2. The generated site can be deployed anywhere (e.g. Netlify)
3. The site remains lightweight without unnecessary http requests and downloads for the end-user
4. Build time is minimal

I've found Gatsby, Next.js, and other frameworks to be extremely powerful, but extremely cumbersome. Sometimes you just want to build a blog or a product page and you don't want to be bothered with the whizz-bang details.

I'd like to add some bells and whistles -- some optional configuration, etc. -- but this three-step process should never change. As the name suggests, 5sg is meant to be simple, and to stay simple. If you're building something complex which requires more functionality, this might not be the right starting point for you. Look into one of the big names Gatsby, Next.js, Hugo, Eleventy, Sapper, Jekyl, and Elder.js are well established and tend to be pretty great. That said, 5sg is **also** meant to be a boiler plate, so go nuts changing whatever you want.

## Why svelte?

I'm a React developer, and I love React. But following the simplicity principal, svelte wins. You can write straight up HTML + CSS and be done with your page if you want. That's pretty special.

## Why not use SSG XYZ instead of 5SG?

At this point I can definitely say: you should use something else. This is a work in progress.

More generally, and what I hope the answer to be in the future:

5SG is built to be stupid simple to use. While other similar frameworks are much more flexible and powerful, I believe 5SG can be used after 2 minutes of introduction.

Also, I suffer from the need to build my own version of things, and this is a good opportunity for me to learn. 🤷‍♀️

## Roadmap to a v1

See https://github.com/cborchert/5sg/projects/1

If I ever make it to a version 1, the path will look like this

- [x] 1. Dev Server + Basic Hot Reloading
  - Given `.md` and `.svelte` files in a `./content` directory, and a `./frontend/templates/Page.svelte` file, create a `GET /xxx.html` path in express
  - Reload server whenever a file changes
- [x] 2. Make a basic Readme
- [x] 3. Build
  - Given `.md` and `.svelte` files in a `./content` directory, and a `./frontend/templates/Page.svelte` file, create a `xxx.html` file in the `/build` directory ready to be published
- [x] 4. Customization of individual page using frontmatter
  - [x] Generate Excerpt
  - [x] SEO
  - [x] title
  - [x] Custom Paths
  - [x] Published flag
- [x] 5. Content Improvements
  - [x] Add `./static` folder which is copied over to build
  - [x] Relative images are copied correctly to `/build`
  - [x] Relative links are treated correctly
  - [x] Global CSS file
  - [x] Global Scripts file

**POC ready once 1 - 5 complete**

Once the first five tasks are complete, we should do a little refactor and present an example site/project. Also this would be a good time to think about including prettier, putting config in an easy to access place, etc.

- [x] 6. Content Improvements pt. 2
  - [x] Add (optional) remark/rehype plugins for
    - [x] Emojis
    - [x] ~~Katex:~~ Plugin not working??
    - [x] ~~Prism~~ Prism takes to long, using highlight.js
    - [x] Footnotes
- [x] 7. Allow for Multiple Templates
- [x] 8. Post processing of content data
  - [x] Gather information and push to each page to allow for more complicated build ("next post" links, "tags" page, etc.)
    - [x] List of pages and their attributes, their links
    - [x] Site meta data
  - [x] Create tags page
  - [x] Create categories page
  - [x] Create a blog feed page
- [x] 9. Image Processing
  - [x] Preprocess images using sharp
  - [x] use sharp or blurhash to create several image sizes
  - [x] implement blur up affect for images and reduce page load
- [ ] 10. Performance
  - [ ] Dev server be very fast and should reload the browser on save using livereload
  - [ ] Reduce build time
  - [ ] Reduce page footprint as much as possible
    - [ ] Introduce a bundler and/or minimization process
  - [ ] Use a cache to speed up consecutive builds (incremental builds)
  - [x] Consider using [turbolinks](https://github.com/turbolinks/turbolinks) to give pages a SPA feel
  - [ ] Properly handle images:
    - [ ] Use next-gen formats with fallbacks
    - [ ] Make sure to correctly size images
    - [ ] Make sure to correctly encode images
    - [x] Set image width and height attribute
- [ ] 11. Partial Hydration
  - [ ] Allow for use of svelte beyond as a templating language using partial hydration of marked components / templates
- [ ] 12. More research
  - [ ] Is it any good ? What needs to change in the API before launching v1?
- [ ] Lucky number 13: Write up docs / readme, give example usage

## Stretch goals:

- Support MDX style components for svelte ([MDSvex](https://mdsvex.com/))
- Support wiki-style links and images (as used in Roam Research and Obsidian, e.g. `[[My Page Name]]`, `![[My Image.jpg]]`)
  - see https://github.com/landakram/remark-wiki-link

## Build Times

For the sake of benchmarking, I've loaded ~1000 local content files of real content. As I work on this project, I'll run `yarn build:quiet` to keep track of the build speed. The end goal for v1 is to be at least as fast as a similar site using Gatsby or Hugo.

| Date       | Commit  | time  | description               |
| ---------- | ------- | ----- | ------------------------- |
| 2 jan 2021 | 02c3b91 | 4.12s |                           |
| 2 jan 2021 | 1932e2d | 3.98s |                           |
| 3 jan 2021 | 41ad3ca | 3.81s |                           |
| 4 jan 2021 | 52ec0c7 | 5.76s | with relative links       |
| 4 jan 2021 | d15eb8d | 5.40s | with basic image handling |
| 4 jan 2021 | 02c6e02 | 5.57s | with sharp image handling |
| 4 jan 2021 | 06f5e49 | 5.63s | with global includes      |
| 8 jan 2021 | dd1b07b | 6.71s | After refactors           |
| 8 jan 2021 | 48e68af | 6.80s | Add multiple templates    |
| 8 jan 2021 | 8a5cdc2 | 7.46s | Parse svelte              |

**NOTE:** ~In order to properly test this for dynamically generated content (tags, categories, blog feed), I need to generate a data set of 1000 posts which accurately uses these attributes.~

**NOTE2:** I created 100 images and 1000 interlinked blog posts as a new basis for testing. Weirdly enough, even though I have not put anything in caching, the initial build took 40 seconds while the subsequent build took 10s. Is it possible that some of the files were saved in RAM or something? I don't know enough about this to give a correct explanation. It took 21 seconds on netlify

| Date        | Commit  | time           | description                               |
| ----------- | ------- | -------------- | ----------------------------------------- |
| 11 jan 2021 | f199adc | 39.39s / 9.54s | New Content, parse interlinked blog posts |

### More timing notes (14 Jan 2021)

As we get closer to finishing the proof of concept, I wanted to note the following timings fron generateContent.js

```
Removing previous build...
Previous build deleted.
Copying static files to build...
Copied.
Generating content...
Content nodes found: 1000
Getting files: 28.864ms
Processing content: 4.393s
Page nodes found: 2
Getting pages: 15.573ms
Processing pages: 13.495ms
Creating dynamic pages: 4.046ms
Post processing html: 10.623s
Building html for 1145 nodes...
Publishing content: 74.281ms
Processing 100 images...
Publishing images: 24.951ms
Publishing meta: 1.312ms
Done
```

Unsurprisingly, the things that take the longest are:

1. Processing content (getting a map of initial HTML from markdown files): 4.3s
2. PostProcessing content (transforming all rendered HTML, replacing links, etc): 10.6s

What is surprising is:

- These operations are more expensive by 2 - 3 orders of magnitude
- Processing images is really quick

Insights:

- I/O operations are not expensive AT ALL. They are negligable. Reading 1000 md files + writing 1145 html files to disk costs ~100ms, where reading is about 1/3 the cost of writing. As an estimate, we can say that `ioTimeInSeconds = .1 * numFiles`.
- Spending some time writing and reading cache files of processed markdown would cost milliseconds and would save up to 4 seconds. Caching processed markdown is a simple operation since markdown files have no dependencies: you can just check if the markdown file is newer than the cached html file or if the html file doesn't exist; in that case, process the markdown, otherwise, use the saved html. We do need to take into account changes in configuration as well, though (if the user adds a remark plugin, we should not serve cached markdown).
- Caching post processed content would be the biggest save, but much more difficult to implement. Each final html file has a much more complicated dependencies tree:
  - The html created during processing
  - The template file used to render it
  - The template file's dependencies
  - The PROPS that go into the template file (which is the entire node map)
  - The generateHtml file

Of the issues mentioned above, the hardest is the _props_ problem. What we are currently doing is injecting the entire node map into the components and letting them solve the issues of sibling nodes, etc.

This means that changing blog post number 1000 is affecting blog post number 2 -- whereas blog post number 1 only really cares about blog post numbers 1, 2, and 3. The best way around this is to preprocess the props and inject only what is needed, but this has a negative side effect: it hamstrings our users by providing less information, unless:

1. we pass several versions of the props to each template (nodeData, siblings, blogPosts, etc.), and then we use svelte.compile to determine the props that will be used and use that as a cache key

or

2. we can allow the users to add a config for templates to generate the props.

In either case, there's work to do, but the upshot is that we can save 4 seconds (i.e. 1/4 of build time) simply by using caching.

Another avenue of investigation is to look into which parts of the postprocessing is taking the most time. If using unified to translate HTML
takes a significant amount of time, we can simply drop unified and use simple string replacement (unified creates an AST map for the content and then traverses that in order to update the links, which may be costly). If it really is the svelte compile process, we'll have to look into the complications above.

## API Notes

### Generating page data and metadata in markdown files

Markdown is processed and transformed in `/utils/processor`.

#### SEO

In `/utils/processor`, a `data.seo` node is added to the markdown data.

The **title** (`data.seo.title`) is either taken from `frontmatter.title` or generated automatically from the first heading element in the markdown file (i.e. h1, h2, h3...). Yep, if you're silly enough to put an h5 at the top of your page, and not to put a title in the frontmatter, well, you get what you paid for.

The **metadescription** (`data.seo.description`) is either taken from `frontmatter.description`, `frontmatter.extract` (in that order), or generated automatically from the first 250 characters of the non-header text of the markdown file.

#### Permalinks

Permalinks are generated in `/generateContent`. The order of priority is:

- the value of `frontmatter.permalink`, if it exists
- the value of `frontmatter.path`, if it exists
- the value of `frontmatter.route`, if it exists
- the value of `frontmatter.slug`, if it exists
- the path of the file in the `/content` folder

Once obtained, the permalink is sanitized:

- Only alpha numeric characters, plus \_ and - are allowed (the rest are removed. Désolé les français, mais les-franc-maçons.md deviendra les-franc-maons.html 🤷‍♀️.)
- The permalink is transformed to lowercase
- We replace the extension with `.html`

## Other notes

### node version

Node 12 is necessary for the majority of unified (remark/rehype) plugins. Unfortunaltely, newer versions such as 14 is not supported. I'd recommend using [nvm](https://github.com/nvm-sh/nvm) to use the correct version.

```terminal
# install nvm using cURL https://github.com/nvm-sh/nvm#install--update-script
# install the version of node identified in .nvmrc
> nvm install
# use the version of node identified in .nvmrc
> nvm use
```

If you run into an error while doing `npm install` or `yarn`, then try reading the message -- it is probably your node version which is incorrect because of the unified plugins.
