#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

import arg from 'arg';

import defaultConfig from './defaultConfig.js';
import { initBuild } from '../src/build.js';

// Get the arguments from the process
const args = arg({
  '--serve': Boolean, // if true, will serve the public folder.
  '--log-level': String, // one of 'fatal', 'error', 'warn', 'info', 'debug', 'trace' or 'silent'. See https://getpino.io/#/docs/api?id=level-string
  '--port': Number, // the port to serve on
});

// the path to the directory in which the process was called
const processDirectory = process.cwd();

// get the user defined config
const configPath = path.join(processDirectory, 'config.js');
const configExists = fs.existsSync(configPath);
let config = defaultConfig;
if (configExists) {
  try {
    const { default: userConfig } = await import(configPath);
    config = userConfig;
    if (!config || typeof config !== 'object') {
      throw new Error('config.js must export an object');
    }
  } catch (e) {
    console.error("Something wrong with the directory's config.js file. Using default.");
    console.error(e);
    config = defaultConfig;
  }
} else {
  console.warn('No config.js file found. Using default.');
}

// start the build
initBuild(args, config);
