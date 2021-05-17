import fs from 'fs-extra';
import path from 'path';
import pino from 'pino';
import htmlParser from 'node-html-parser';
import _isEqual from 'lodash/isEqual.js';
import sharp from 'sharp';

import chokidar from 'chokidar';
import browserSync from 'browser-sync';

import bundle from './utils/bundle/bundle.js';
import buildRollupConfig from './utils/bundle/buildRollupConfig.js';
import hydrationRollupConfig from './utils/bundle/hydrationRollupConfig.js';
import createComponentHydrationScript from './utils/bundle/hydration/createComponentHydrationScript.js';

import { getAllDirectoryFiles, isNewer, copyIfNewer, createDir } from './utils/io.js';
import generateHtmlFileContent from './utils/generateHtmlFileContent.js';

import './types/typedefs.js';

const CWD = process.cwd();
const SRC_DIR = path.join(CWD, './src');
const BUILD_DIR = path.join(CWD, '.5sg/build');
const DYNAMIC_BUILD_DIR = path.join(CWD, '.5sg/dynamic');
const PUBLIC_DIR = path.join(CWD, './public');
const STATIC_DIR = `${SRC_DIR}/static`;
const CONTENT_DIR = `${SRC_DIR}/content`;
const PUBLIC_STATIC_DIR = `${PUBLIC_DIR}/static`;

/** @todo move to constants dir */
// matches links starting with http://, https://, file://, //, etc.
const REGEX_EXTERNAL_LINK = /^[A-Za-z0-9]*:?\/\//;
// paths starting with / are absolute paths
const REGEX_IS_ABSOLUTE_PATH = /^\//;

/** @todo get from config */
// this could be a subdirectory or a url
const SERVER_ROOT = '/';

const srcRollupConfig = buildRollupConfig(CONTENT_DIR, BUILD_DIR);

let logger = pino({ prettyPrint: true });

/**
 * It doesn't do much
 */
const noOp = () => {};

/**
 * By default, get dynamic nodes doesn't do anything
 * @param {*} _ dummy input
 * @returns {Array} an empty array
 */
let getDynamicNodes = (_) => [];

/**
 * Gets the base name from the dynamic slug name
 * @param {string} slug the slug name
 * @returns {string} the name
 */
const getNameFromDynamicSlug = (slug) => slug.replace(/\.dynamic$/, '');

/**
 * @type {boolean} if true, the pipeline will run at the next opportunity
 */
let needsBuild = false;

/**
 * @type {boolean} if true, there's already build in process
 */
let building = false;

/**
 * @type {boolean} if true, we can start
 */
let readyToBuild = false;

/**
 * @type {Object=} the src rollup bundle cache
 */
let srcRollupCache;

/**
 * @type {Object=} the dynamic rollup bundle cache
 */
let dynamicRollupCache;

/**
 * @type {Object=} the hydration rollup bundle cache
 */
let hydrationRollupCache;

/**
 * @type {Object<string, ContentNode>} the content nodes where the key is the content file/facadeModuleId
 */
let nodeMap = {};

/**
 * Sets needsBuild to true, tries to start build
 * @param {boolean=} setIsReady if true, sets readyToBuild to true
 * @returns {void}
 */
const queueBuild = (setIsReady = false) => {
  if (setIsReady) readyToBuild = true;
  needsBuild = true;
  startBuild();
};

/** @todo */
const siteMeta = {};

/**
 * Deletes artifacts / created files associated with the node
 * @param {ContentNode} node
 */
const removeNodeArtifacts = (node) => {
  if (!node) return;
  /** @todo delete all artifacts! */

  // the node now counts as not rendered
  node.isRendered = false;
};

/**
 * @type {NodeMeta} the nodeMeta from the previous build
 */
let previousNodeMeta = {};

/**
 * Given a file in the src/content directory get its public path
 * @param {string} filePath the absolute file path
 * @returns {string}
 */
const getContentFilePublicPath = (filePath) => {
  /** @todo THIS MIGHT CHANGE */
  const srcAbsPath = path.resolve(CONTENT_DIR);
  const publishAbsPath = path.resolve(PUBLIC_DIR);
  const relPath = path.relative(srcAbsPath, filePath);
  const destPath = path.join(publishAbsPath, relPath);
  return destPath;
};

/**
 * copy a file from the content directory to the public directory (if newer)
 * @param {string} filePath
 * @returns {Promise}
 */
const publishContentFile = (filePath) => {
  const destPath = getContentFilePublicPath(filePath);
  return copyIfNewer(filePath, destPath);
};

/**
 * launches the build process
 * @returns void
 */
const startBuild = async () => {
  logger.debug('build process initiated');
  logger.debug({ needsBuild, building, readyToBuild });
  // we won't build unless we need to and we can
  if (!needsBuild || building || !readyToBuild) {
    logger.debug("we don't need to build");
    return;
  }
  console.log('building');
  console.time('build');

  // needsBuild will turn back to true if we receive any modifications while building
  needsBuild = false;
  building = true;

  /** @type {Object<string, ImportedComponent>} the cached result of importing the bundled component modules where the key is the facadeModuleId */
  const componentCache = {};
  /** @type {NodeMeta} the metadata from the content nodes */
  const nodeMeta = {};

  /**
   * Remove a content node from the caches and filesystem
   * @param {string} facadeModuleId the key / facadeModuleId of the node to remove
   */
  function removeNode(facadeModuleId) {
    removeNodeArtifacts(nodeMap[facadeModuleId]);

    delete nodeMap[facadeModuleId];
    delete componentCache[facadeModuleId];
    delete nodeMeta[facadeModuleId];
  }

  console.time('bundling');
  // 1. Create a bundle of the components used in src/content
  const { output: srcBundleOutput } = await bundle(srcRollupConfig, 'content').catch((e) => {
    console.error('Problem while bundling the content');
    console.error(e);
    return {};
  });
  console.timeEnd('bundling');

  console.time('pruning');
  // 2. for each existing node, if it does not exist in the output, then it has been deleted.
  // remove the node and delete its artifacts
  Object.entries(nodeMap).forEach(([facadeModuleId, node]) => {
    // if the node exists in the output, keep the node on the nodeMap
    if (
      // FIXME: ERROR: Property 'facadeModuleId' does not exist on type 'OutputChunk | OutputAsset'.
      // Weird, though, since OutputChunk extends RenderedChunk which extends PreRenderedChunk which has the prop facadeModuleId
      // Might be a limitation of jsdocs as a type system ?
      // @ts-ignore
      srcBundleOutput.find((chunk) => facadeModuleId === chunk.facadeModuleId)
    )
      return;

    // otherwise, the node no longer exists, e.g. has been deleted
    // remove the generated files and records
    removeNode(facadeModuleId);
  });
  console.timeEnd('pruning');

  console.time('nodeMap');
  // 3. for each chunk output by rollup, update/create the nodeMap
  srcBundleOutput.forEach((chunk) => {
    // @ts-ignore See above: OutputChunk extends RenderedChunk which extends PreRenderedChunk which has the prop isEntry, etc.
    const { isEntry, facadeModuleId, fileName, name } = chunk;
    // nodeMap entries are only for entries
    if (!isEntry) return;

    /** @type {ContentNode} */
    const newNode = {
      facadeModuleId,
      fileName,
      name,
      isDynamic: false,
      isRendered: false,
      prevProps: undefined,
      publicPath: undefined,
    };

    const existingNode = nodeMap[facadeModuleId];
    if (!!existingNode) {
      // If the node already exists, and the fileName has not changed, there's nothing to do
      if (existingNode.fileName === fileName) return;
      // Otherwise, if the node already exists, the the input file changed and it needs to be rebuilt
      // remove the generated files and records
      removeNode(facadeModuleId);
    }

    newNode.publicPath = `${name}.html`;

    // update/create the new
    nodeMap[facadeModuleId] = newNode;
  });
  console.timeEnd('nodeMap');

  console.time('import');
  // 4. for each file-based component, extract the metadata
  // This can all happen in parallel, so we create a promise for each node and await the array of promises
  /** @type {Array<Promise<Void>>} */
  const importPromises = Object.keys(nodeMap).map(
    async (facadeModuleId) =>
      new Promise(async (resolve, reject) => {
        try {
          const node = nodeMap[facadeModuleId];

          // import each bundled file and get the exported props and the component for rendering
          // dynamic nodes are generated -- they cannot be imported
          if (node.isDynamic || !node.fileName) {
            resolve();
            return;
          }

          const {
            metadata,
            deriveProps,
            hydrate,
            default: Component,
          } = await import(path.join(BUILD_DIR, `/bundled/${node.fileName}`));

          // store the results in the for future reference during this build
          componentCache[facadeModuleId] = { metadata, deriveProps, hydrate, default: Component };
          nodeMeta[facadeModuleId] = { metadata, publicPath: node.publicPath };
          resolve();
        } catch {
          // on error, all traces of the node should be removed
          // remove the generated files and records
          removeNode(facadeModuleId);
          reject();
        }
      }),
  );
  await Promise.allSettled(importPromises);
  console.timeEnd('import');

  // 5, (6->7->8), 9, 10 can be done in parallel

  const nodeMetaDataHasNoDiff = _isEqual(previousNodeMeta, nodeMeta);

  console.time('dynamic');
  // 5. create dynamic pages
  // if nodeMeta hasn't changed, skip
  if (!nodeMetaDataHasNoDiff) {
    // delete all existing dynamic nodes
    Object.values(nodeMap).forEach((contentNode) => {
      if (contentNode.isDynamic) removeNode(contentNode.facadeModuleId);
    });

    // getDynamicNodes
    const dynamicNodes = getDynamicNodes(Object.values(nodeMeta));

    if (dynamicNodes.length) {
      // For each dynamic node
      // bundle the components
      const dynamicComponents = dynamicNodes.reduce(
        (prev, { component }) => (prev.includes(component) ? prev : [...prev, component]),
        [],
      );

      const dynamicRollupConfig = buildRollupConfig('', DYNAMIC_BUILD_DIR, dynamicComponents);
      const { output: dynamicBundleOutput } = await bundle(dynamicRollupConfig, 'dynamic').catch((e) => {
        // for the moment swallow errors
        /** @todo detect whether there are files to bundle before running the bundler. if there's no files to process, this will throw */
        return {};
      });

      // for each dynamic node, import its component and add it to the nodemap
      const dynamicNodeProcessingPromises = dynamicNodes.map(({ component, props, slug }) => {
        return new Promise(async (resolve, reject) => {
          try {
            // the slug will be used as the unique key, and the slug minus the dynamic extension will be used as the name
            const facadeModuleId = slug;
            const name = getNameFromDynamicSlug(facadeModuleId);

            // import the dynamic node's component
            const bundledComponent = dynamicBundleOutput.find(({ facadeModuleId = '', isEntry, fileName }) => {
              return isEntry && facadeModuleId.endsWith(component) && fileName;
            });
            if (!bundledComponent) return;
            const {
              metadata,
              deriveProps,
              hydrate,
              default: Component,
            } = await import(path.join(DYNAMIC_BUILD_DIR, `/bundled/${bundledComponent.fileName}`));

            // and cache it for rendering
            componentCache[facadeModuleId] = {
              metadata,
              deriveProps,
              hydrate,
              default: Component,
              additionalProps: props,
            };

            // add the dynamic node to the nodemap
            nodeMap[facadeModuleId] = {
              facadeModuleId,
              fileName: undefined,
              name,
              isDynamic: true,
              isRendered: false,
              prevProps: undefined,
              publicPath: `${name}.html`,
            };

            resolve();
          } catch {
            reject();
          }
        });
      });
      await Promise.allSettled(dynamicNodeProcessingPromises);
    }
  }
  console.timeEnd('dynamic');

  /** @todo other prop dependencies => sitemetadata etc*/
  const siteMetaDataHasNoDiff = true;
  const globalPropsHasNoDiff = siteMetaDataHasNoDiff && nodeMetaDataHasNoDiff;

  // 6 -> 7 -> 8 is a series which should occur for each node, but each node can happen in parallel.

  console.time('render');
  const hydratedComponentsToBuild = new Set();
  // 6. render each content node
  // This can all happen in parallel, so we create a promise for each node and await the array of promises
  /** @type {Array<Promise<Void>>} */
  const renderPromises = Object.keys(nodeMap).map(
    async (facadeModuleId) =>
      new Promise(async (resolve, reject) => {
        try {
          const hydratedComponents = new Set();
          const node = nodeMap[facadeModuleId];
          const { isRendered, prevProps, name, publicPath } = node;

          // retrieve the module from the cache
          const {
            metadata = {},
            deriveProps = noOp,
            additionalProps = {},
            default: Component,
          } = componentCache[facadeModuleId];

          // skip rendering if the node has already been rendered and the global meta data has not changed
          // this prevents going through the possibly heavy task of calculating the derived props
          if (isRendered && globalPropsHasNoDiff) {
            resolve();
            return;
          }

          const nodeData = {
            facadeModuleId,
            name,
          };

          // calculate the derived props.
          // this allows each component to not receive all the data from the entire site as props
          const derivedProps = deriveProps({ nodeMeta, nodeData });

          const props = {
            nodeData,
            siteMeta,
            ...derivedProps,
            ...additionalProps,
          };

          // skip rendering if the node has already been rendered and the local props haven't changed
          const localPropsHasNoDiff = _isEqual(props, prevProps);
          node.prevProps = props;
          if (isRendered && localPropsHasNoDiff) {
            resolve();
            return;
          }

          // render
          const { html, css: { code: styles = '' } = {}, head: templateHeadContent } = Component.render(props);
          let head = templateHeadContent;

          // prepare partial hydration
          // @ts-ignore tslint is having trouble with htmlParser -- it thinks that it's already the parse method
          // for each hydratable component present on the page
          // - add a script tag to the header to flag the import of the component hydration script
          // - add the component of the list of components to build hydration scripts for
          const htmlRoot = htmlParser.parse(html);
          htmlRoot.querySelectorAll('[data-5sg-hydration-component]').forEach((el) => {
            const importPath = el.getAttribute('data-5sg-hydration-component');
            hydratedComponents.add(importPath);
          });
          hydratedComponents.forEach((componentPath) => {
            head += `<script data-5sg-hydration-src="${componentPath}"></script>`;
            hydratedComponentsToBuild.add(componentPath);
          });

          // feed html, css, head into template
          const htmlContent = generateHtmlFileContent({ head, styles, html });
          const outputPath = `${BUILD_DIR}/rendered/${publicPath}`;
          const outputDirectory = path.dirname(outputPath);

          // save html file
          if (!fs.existsSync(outputDirectory)) {
            // errors will be caught by parent
            fs.mkdirSync(outputDirectory, { recursive: true });
          }
          // write content to file
          fs.writeFile(outputPath, htmlContent, (err) => {
            if (err) {
              // will be caught and resolved below
              throw err;
            }
            node.isRendered = true;
            resolve();
          });
        } catch (e) {
          // on error, all traces of the node should be removed
          // remove the generated files and records
          removeNode(facadeModuleId);
          reject();
        }
      }),
  );
  await Promise.allSettled(renderPromises);

  console.timeEnd('render');

  /** @todo */
  console.time('hydrationBundle');
  const hydrationScriptPromises = Array.from(hydratedComponentsToBuild).map(
    (scriptPath) =>
      new Promise((resolve, reject) => {
        const scriptFileName = scriptPath.replace(/\//g, '-').replace('.svelte', '-hydration.js');
        const outputPath = `${BUILD_DIR}/hydration/${scriptFileName}`;
        console.log(outputPath);
        const outputDirectory = path.dirname(outputPath);
        const hydrationScriptText = createComponentHydrationScript(scriptPath);
        if (!fs.existsSync(outputDirectory)) {
          // errors will be caught by parent
          fs.mkdirSync(outputDirectory, { recursive: true });
        }
        // write content to file
        fs.writeFile(outputPath, hydrationScriptText, (err) => {
          if (err) {
            // will be caught and resolved below
            reject(err);
          }
          resolve();
        });
      }),
  );
  await Promise.all(hydrationScriptPromises);

  const { output: hydrationBundleOutput } = await bundle(hydrationRollupConfig, 'hydration').catch((e) => {
    // for the moment swallow errors
    /** @todo detect whether there are files to bundle before running the bundler. if there's no files to process, this will throw */
    console.log(e);
    return {};
  });
  console.timeEnd('hydrationBundle');

  console.time('publish');
  /** @todo this should be another rollup step */
  // 7. ((post render html to do url replacement and image replacement)) => 8. move over to public
  const publishPromises = Object.keys(nodeMap).map(
    async (facadeModuleId) =>
      new Promise(async (resolve, reject) => {
        try {
          const node = nodeMap[facadeModuleId];
          const { publicPath } = node;
          const renderPath = `${BUILD_DIR}/rendered/${publicPath}`;
          const outputPath = `${PUBLIC_DIR}/${publicPath}`;
          const outputDirectory = path.dirname(outputPath);

          // skip if published file is newer than rendered file
          if (isNewer(outputPath, renderPath)) {
            return resolve();
          }

          let htmlContent = fs.readFileSync(renderPath, 'utf8');

          // transform links
          // @ts-ignore tslint is having trouble with htmlParser -- it thinks that it's already the parse method
          const htmlRoot = htmlParser.parse(htmlContent);
          const links = htmlRoot.querySelectorAll('a');
          links.forEach((link) => {
            const href = link.getAttribute('href');
            if (REGEX_EXTERNAL_LINK.test(href)) {
              // treat external links
              link.setAttribute('target', '_blank');
            } else if (REGEX_IS_ABSOLUTE_PATH.test(href)) {
              // treat absolute paths starting with /
              const finalPath = path.join(SERVER_ROOT, href.replace(/\.\w+$/, '.html'));
              link.setAttribute('href', finalPath);
            } else {
              // deal with relative paths
              const relPath = path.join(path.dirname(publicPath), href);
              const finalPath = path.join(SERVER_ROOT, relPath.replace(/\.\w+$/, '.html'));
              link.setAttribute('href', finalPath);
            }
          });

          // transform image tags
          const images = htmlRoot.querySelectorAll('img:not(.cover)');
          images.forEach((image) => {
            const src = image.getAttribute('src');
            if (REGEX_EXTERNAL_LINK.test(src)) {
              // treat external images
              return;
            }
            let finalSrc = '';

            if (REGEX_IS_ABSOLUTE_PATH.test(src)) {
              // treat absolute paths starting with /
              finalSrc = path.join(SERVER_ROOT, src);
            } else {
              // deal with relative paths
              const relPath = path.join(path.dirname(publicPath), src);
              finalSrc = path.join(SERVER_ROOT, relPath);
            }

            // old solution
            // image.setAttribute('src', finalSrc);

            // replace image with picture
            const srcExt = path.extname(finalSrc);
            const sources = [finalSrc.replace(srcExt, '.avif'), finalSrc.replace(srcExt, '.webp')].map(
              (srcSet) => `<source srcset="${srcSet}" />`,
            );
            sources.push(`<img src="${finalSrc}" />`);
            const classes = new Array(image.classList).join(' ');
            const alt = image.getAttribute('alt');
            // @ts-ignore tslint is having trouble with htmlParser -- it thinks that it's already the parse method
            const picture = htmlParser.parse(`<picture class="${classes}" alt="${alt}">${sources.join('')}</picture>`);
            image.replaceWith(picture);
          });

          // handle hydration script imports
          const hydrationScripts = htmlRoot.querySelectorAll('script[data-5sg-hydration-src]');
          hydrationScripts.forEach((script) => {
            // find the bundled file which has a path matching the path of the created hydration file
            const scriptPath = script.getAttribute('data-5sg-hydration-src');
            const rawPath = scriptPath.replace(/\//g, '-').replace('.svelte', '-hydration.js');
            const bundledComponent = hydrationBundleOutput.find(({ facadeModuleId = '' }) =>
              facadeModuleId.endsWith(rawPath),
            );
            if (!bundledComponent || !bundledComponent.fileName) {
              script.remove();
            }
            script.setAttribute('src', `/scripts/hydration/${bundledComponent.fileName}`);
            script.removeAttribute('data-5sg-hydration-src');
            script.setAttribute('defer', '');
          });

          /** @todo minify html */
          /** @todo other post-processing transforms */

          htmlContent = htmlRoot.toString();

          /** @todo refactor DRY */
          // write final html content to file
          createDir(outputDirectory);
          fs.writeFile(outputPath, htmlContent, (err) => {
            if (err) {
              // will be caught and resolved below
              throw err;
            }
            node.isRendered = true;
            resolve();
          });
        } catch (e) {
          // on error, all traces of the node should be removed
          // remove the generated files and records
          removeNode(facadeModuleId);
          reject();
        }
      }),
  );
  await Promise.allSettled(publishPromises);
  console.timeEnd('publish');

  console.time('transform');
  // 9. ((transform images and other files in src/content))
  // get all files in the src/content directory that have not already been processed
  const contentFiles = getAllDirectoryFiles(CONTENT_DIR);
  const unProcessedContentFiles = contentFiles.filter((filePath) => !nodeMap[filePath]);
  // ... and transform or copy them
  const transformContentPromises = unProcessedContentFiles.map(
    (filePath) =>
      new Promise(async (resolve, reject) => {
        /** @todo get transformer */

        // apply transform to jpg files
        if (path.extname(filePath) === '.jpg') {
          const destPath = getContentFilePublicPath(filePath);
          const paths = [destPath, destPath.replace('.jpg', '.avif'), destPath.replace('.jpg', '.webp')];
          const transformer = (resultPath) => {
            if (isNewer(resultPath, filePath)) {
              // don't rewrite if we don't need to
              return Promise.resolve();
            }
            createDir(path.dirname(resultPath));
            return sharp(filePath).resize(800, 400, { fit: 'inside', withoutEnlargement: true }).toFile(resultPath);
          };
          const transformImagePromises = paths.map(transformer);
          await Promise.allSettled(transformImagePromises);
          return resolve();
        }

        // skip md and svelte files
        if (['.svelte', '.md'].includes(path.extname(filePath))) {
          return resolve();
        }

        // copy other files
        await publishContentFile(filePath);
        return resolve();
        // else, if the file fits one of the patterns / extensions
        //    check the previous transformMap[filePath]
        //      if !exist
        //        useTransform
        //          on success => add to transform map
        //      if exist
        //        check if output file(s) exists
        //          if so, check if input file is newer than the output file(s)
        //            if so, useTransform
        //              onSuccess => add to tranform map
        //            else => do nothing
        //          else useTransform => onSuccess => add to tranform map
        // if no useTransform exists for the given file, simply copy the file without transform and update the transform map
      }),
  );
  await Promise.allSettled(transformContentPromises);
  console.timeEnd('transform');

  console.time('static');
  // 10. transfer static files
  const staticCopyPromise = new Promise((resolve, reject) => {
    fs.remove(PUBLIC_STATIC_DIR, (removeErr) => {
      if (removeErr) return reject(removeErr);
      if (fs.existsSync(STATIC_DIR)) {
        fs.copy(STATIC_DIR, PUBLIC_STATIC_DIR, (copyErr) => {
          if (copyErr) return reject(copyErr);
          return resolve();
        });
      } else {
        return resolve();
      }
    });
  });
  await staticCopyPromise;
  console.timeEnd('static');

  /** @todo build sitemap */

  // save the current nodeMeta for the next build to make things quicker
  previousNodeMeta = nodeMeta;
  // indicate that the build has finished
  building = false;
  console.timeEnd('build');
  // try to start the next build if necessary
  startBuild();
};

export const initBuild = (processArgs, config) => {
  /** @todo delete previous build */
  // get args
  const argDefaults = {
    '--serve': false,
    /** @todo set back to error */
    // '--log-level': 'error',
    '--log-level': 'debug',
    '--port': 3221,
  };
  const args = {
    ...argDefaults,
    ...processArgs,
  };

  logger.level = args['--log-level'];

  if (config && typeof config.getDynamicNodes === 'function') {
    getDynamicNodes = config.getDynamicNodes;
  }

  if (args['--serve']) {
    // they want us to serve
    // kick things off by watching the src directory
    const watcher = chokidar.watch([SRC_DIR]);
    // On file change in the src directory, queue a new build
    watcher.on('add', (fileName) => {
      logger.debug(`file added: ${fileName}`);
      queueBuild(false);
    });
    watcher.on('change', (fileName) => {
      logger.debug(`file modified: ${fileName}`);
      queueBuild(false);
    });
    watcher.on('unlink', (fileName) => {
      logger.debug(`file removed: ${fileName}`);
      queueBuild(false);
    });

    // when the initial watch is done, we can get rolling
    watcher.on('ready', () => {
      queueBuild(true);
    });

    // start dev server
    const server = browserSync.create();
    server.init({
      server: 'public',
      watch: true,
      port: args['--port'],
      open: false,
    });
  } else {
    queueBuild(true);
  }
};

export default startBuild;
