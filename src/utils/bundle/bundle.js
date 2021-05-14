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
  // get the previous cache
  const prevCache = (cacheName && BUNDLE_CACHE[cacheName]) || false;

  console.log({ cacheName, prevCache: !!prevCache });

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
