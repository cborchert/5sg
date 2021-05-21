/**
 * @typedef {Object} ContentNode a single block of content in the nodeMap
 * @property {string} facadeModuleId the path of the input file
 * @property {string} fileName the path relative to .5sg/build/bundled for the component
 * @property {string} name the publish path / slug
 * @property {string} publicPath the publish path with extension
 * @property {boolean} isDynamic if true, the ContentNode was created dynamically rather than from a file
 * @property {boolean} isRendered if true, the ContentNode has been rendered
 * @property {Object=} prevProps the props last used to render the html
 * @property {Set<string>=} hydratedComponents the hydrated components of the component
 */

/**
 * @typedef {Object} ImportedComponent result of importing a bundled svelte component module
 * @property {{render: (any) => any}=} default the Svelte component
 * @property {Object=} metadata the component / file metadata (represents the frontmatter in markdown files)
 * @property {(any)=>Object=} deriveProps the function which will transform the nodeMap and nodeData into props for the component
 * @property {boolean=} hydrate if true, the component should be hydrated client-side
 * @property {Object=} additionalProps any additional props which will be applied to the component (might be used by dynamic nodes)
 */

/**
 * @typedef {Object} NodeMetaEntry
 * @property {Object=} metadata
 * @property {string} publicPath
 */

/**
 * @typedef {Object<string,NodeMetaEntry>} NodeMeta {[facadeModuleId]: extractedModuleMetadata} the node metadata
 */

/**
 * @typedef {Object} RenderablePage
 * @property {Object} props the props to render the component with
 * @property {string} slug the identifier of the page to be rendered
 * @property {string} component the path to the rendering component from the project root
 */
