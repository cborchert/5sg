import * as rollup from 'rollup';

/**
 * The bundle cache
 * @type {Object<string, Object>}
 */
const BUNDLE_CACHE = {};

/**
 * Execute rollup config
 * @param {Object} rollupConfig
 * @param {string|void} cacheName
 * @returns {Promise<Object>} the output and cache from the execution of the rollup operation
 */
export default async function bundle(rollupConfig, cacheName) {
  /**
   * @todo: if rollupConfig.input has no hits, skip ?
   * We're running into an issue where if you save a file with no changes, it will start the rollup process,
   * deleting the old files, and then when it gets to hydration, there's nothing to create, so it errors out
   */

  // get the previous cache
  const prevCache = cacheName && BUNDLE_CACHE[cacheName];

  // run rollup, using the previous cache
  const {
    write: writeBundleFiles,
    close: closeBundle,
    cache,
  } = await rollup.rollup({
    ...rollupConfig,
    cache: prevCache,
  });

  // save the cache for use next time
  if (cacheName) {
    BUNDLE_CACHE[cacheName] = cache;
  }

  // write the bundled files
  const { output } = await writeBundleFiles(rollupConfig.output);

  // wrap up the bundle
  await closeBundle();

  return { output, cache };
}
