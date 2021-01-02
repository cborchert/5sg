# Stupid Simple Svelte Site Generator (5SG)

NOTE: This is like 5 hours old. It's not beta, it's not alpha. It's not even a v.0. It's like a v. negative one. Someday it might kick ass. Today, it doesn't even suck -- it hardly does anything. You've been warned.

## Getting started

For demo purposes of the dev server, try this:

- Clone or the repo
- Run `yarn` or `npm install`
- Copy this readme file to `/content/readme.md`, or add your own content.
- Run `yarn dev`
- Go to [http://localhost:3000/readme.html](http://localhost:3000/readme.html)

Note that, while partial hydration of svelte components is on the roadmap, svelte components are not yet being hydrated (so click handlers and interactive bits won't work).

## Introduction

5SG (working title) is a static site generator boiler plate made for simplicity. It works like this:

1. You put your content in the `/content` directory as `.md` files or `.svelte` files
2. You modify the templates in `/frontend/templates` to suite your design
3. You build (coming soon 👀).

That's it.

I'd like to add some bells and whistles, but this three-step process should never change. As the name suggests, 5SG is meant to be simple, and to stay simple. If you're building something complex which requires more functionality, this might not be the right starting point for you. However, it is meant as a boiler plate, so go nuts changing whatever you want.

## Motivation

The goal of this project is to create a SSG which fulfills the following requirements:

1. It is easy for developers and content creators to create their sites.
2. The generated site can be deployed anywhere (e.g. Netlify)
3. The site remains lightweight without unncessary http requests and downloads for the end user
4. Build time is minimal

I've found Gatsby, Next.js, and other frameworks to be extremely powerful, but extremely cumbersome. Sometimes you just want to build a blog or a product page.

## Why svelte?

I'm a React developer, and I love React. But following the simplicity principal, svelte wins. You can write straight up HTML + CSS and be done with your page if you want. That's pretty special.

## Why not use SSG X?

At this point I can definitely say: you should. This is a work in progress. But, more generally, 5SG is built to be easy to use, i.e. Stupid Simple. While other similar frameworks are much more flexible and powerful, I believe 5SG can be used after 2 minutes of introduction.

Also, I suffer from the need to build my own version of things.

## Roadmap to a v1

If I ever make it to a version 1, the path will look like this

- [x] 1. Dev Server + Basic Hot Reloading
  - Given `.md` and `.svelte` files in a `./content` directory, and a `./frontend/templates/Page.svelte` file, create a `GET /xxx.html` path in express
  - Reload server whenever a file changes
- [x] 2. Make a basic Readme
- [ ] 3. Build
  - Given `.md` and `.svelte` files in a `./content` directory, and a `./frontend/templates/Page.svelte` file, create a `xxx.html` file in the `/build` directory ready to be published
- [ ] 4. Customization of individual page using frontmatter
  - Generate Excerpt
  - SEO
  - Custom Paths
  - Published flag
- [ ] 5. Content Improvements
  - Add `./static` folder which is copied over to build
  - Relative images are copied correctly to `/build`
  - Relative links are treated correctly
  - Global CSS file
- [ ] 6. Content Improvements pt. 2
  - Add remark plugins for
    - Emojis
    - Katex
    - Prism
    - Footnotes
- [ ] 7. Allow for Multiple Templates
- [ ] 8. Post processing of content data
  - Gather information and push to each page to allow for more complicated build ("next post" links, "tags" page, etc.)
    - List of pages and their attributes, their links
    - Site meta data
  - Create tags page
  - Create categories page
  - Create a blog feed page
  - Create an author's page
- [ ] 9. Image Processing
  - Preprocess images using sharp and/or blurhash to create a blur up affect for images and reduce page load
- [ ] 9. Performance
  - Dev server be very fast and should reload the browser on save using livereload
  - Reduce build time
    - Async building ?
  - Reduce page footprint as much as possible
    - Introduce a
  - Use a cache to speed up consecutive builds (incremental builds)
  - Consider using [turbolinks](https://github.com/turbolinks/turbolinks) to give pages a SPA feel
- [ ] 11. Partial Hydration
  - Allow for use of svelte beyond as a templating language using partial hydration of marked components
- [ ] 12. More research
  - Is it any good ? What needs to change in the API before launching v1?
