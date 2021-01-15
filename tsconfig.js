{
    "compilerOptions": {
        "module": "system",
        "noImplicitAny": false,
        "removeComments": true,
        "preserveConstEnums": true,
        "sourceMap": true,
        "outDir": "./dist",
        "rootDir": "./",
        "checkJs": true,
        "allowJs": true,
        "experimentalDecorators": true,
        "moduleResolution": "node",
        "lib": ["es2019"]
    },
    "include": [
        "./ssr/**/*",
        "./build.js"
    ],
    "exclude": [
        "./node_modules",
        "./node_modules/**/*",
        "dist",
        "src"
    ]
}