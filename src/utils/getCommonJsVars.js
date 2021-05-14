import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

/**
 * Returns certain useful conventions from commonJs which esm lacks
 * @param {string} metaUrl the value of import.meta.url of the file
 * @returns {{__filename: string, __dirname: string, require: function}}
 */
export default function getCommonJsVars(metaUrl) {
  /**
   * In order to use require for commonJS modules in an esm context, we need to use mode.createRequire and the current module's url
   * to create the equivalent of commonJS's functionality
   * @see https://nodejs.org/api/module.html#module_module_createrequire_filename
   */
  // @ts-ignore
  const require = createRequire(metaUrl);

  // __filename anbd __dirname are missing in esm context, so we need to create them ourselves if we need them
  const __filename = fileURLToPath(metaUrl);
  const __dirname = dirname(__filename);

  return { require, __filename, __dirname };
}
