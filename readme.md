# Stupid Simple Svelte Static Site Generator (5SG)

NOTE: This is like 5 hours old. It's not beta, it's not alpha. It's not even a v.0. It's like a v. negative one. Someday it might kick ass. Today, it doesn't even suck -- it hardly does anything. You've been warned.

## Getting started

For demo purposes of the dev server, try this:

- Clone or the repo
- Run `yarn` or `npm install`
- Copy this readme file to `/content/readme.md`, or add your own content.
- Run `yarn dev`
- Go to [http://localhost:3000/readme.html](http://localhost:3000/readme.html)

For demo purposes of the build process, try this:

- Clone or the repo
- Run `yarn` or `npm install`
- Copy this readme file to `/content/readme.md`, or add your own content.
- Run `yarn build`
- Check the `./build` directory 🕵️‍♀️

### What the 🤬!? My svelte components DON'T DO ANYTHING

Calm down. Breath. This is normal (for now).

While partial hydration of svelte components is on the roadmap, svelte components are not yet being hydrated (so click handlers and interactive bits won't work). This is intentional -- we want to make sure that we're not sending extra stuff to the front end since our goal is to respect the end user's data consumption as much as possible.

For the moment, this means svelte files should be treated as PRESENTATIONAL components, or templates, if you will.

## Introduction

5SG (working title) is a static site generator boiler plate made for simplicity. It works like this:

1. You put your content in the `/content` directory as `.md` files or `.svelte` files
2. You modify the templates in `/frontend/templates` to suit your design
3. You build using `yarn build`.

That's it. Your site is ready to publish.

I'd like to add some bells and whistles, but this three-step process should never change. As the name suggests, 5SG is meant to be simple, and to stay simple. If you're building something complex which requires more functionality, this might not be the right starting point for you. However, it is meant as a boiler plate, so go nuts changing whatever you want.

## Motivation

The goal of this project is to create a SSG which fulfills the following requirements:

1. It is easy for developers and content creators to create their sites using components and markdown.
2. The generated site can be deployed anywhere (e.g. Netlify)
3. The site remains lightweight without unnecessary http requests and downloads for the end-user
4. Build time is minimal

I've found Gatsby, Next.js, and other frameworks to be extremely powerful, but extremely cumbersome. Sometimes you just want to build a blog or a product page and you don't want to be bothered with the whizz-bang details.

## Why svelte?

I'm a React developer, and I love React. But following the simplicity principal, svelte wins. You can write straight up HTML + CSS and be done with your page if you want. That's pretty special.

## Why not use SSG XYZ instead of 5SG?

At this point I can definitely say: you should use something else. This is a work in progress.

More generally, and what I hope the answer to be in the future:

5SG is built to be stupid simple to use. While other similar frameworks are much more flexible and powerful, I believe 5SG can be used after 2 minutes of introduction.

Also, I suffer from the need to build my own version of things, and this is a good opportunity for me to learn. 🤷‍♀️

## Roadmap to a v1

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

- [ ] 6. Content Improvements pt. 2
  - [ ] Add (optional) remark/rehype plugins for
    - [ ] Emojis
    - [ ] Katex
    - [ ] Prism
    - [ ] Footnotes
- [x] 7. Allow for Multiple Templates
- [ ] 8. Post processing of content data
  - [ ] Gather information and push to each page to allow for more complicated build ("next post" links, "tags" page, etc.)
    - [x] List of pages and their attributes, their links
    - [ ] Site meta data
  - [ ] Create tags page
  - [ ] Create categories page
  - [ ] Create a blog feed page
  - [ ] Create an author's page
- [ ] 9. Image Processing
  - [x] Preprocess images using sharp
  - [ ] use sharp or blurhash to create several image sizes
  - [ ] implement blur up affect for images and reduce page load
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
    - [ ] Set image width and height attribute
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
