'use strict';

// This file contains code that we reuse
// between our tests.

const { build: buildApplication } = require('fastify-cli/helper');
const path = require('path');
const AppPath = path.join(__dirname, '..', 'app.js');

/**
 * Fill in this config with all the configurations
 * needed for testing the application
 * @returns {object}
 */
function config () {
  return {};
}

let testApp;

/**
 * Automatically build and tear down our instance
 * @returns {*}
 */
async function build () {
  // You can set all the options supported by the fastify CLI command
  const argv = [AppPath];

  // Fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  testApp = await buildApplication(argv, config());
  // testApp.getRegisteredPlugin = function (pluginName) {
  //   // NOTE: This method assumes that each plugin has a unique name.
  //   // If the plugins are anonymous, this won't work as expected.

  //   // Access the registered plugins
  //   console.log('here');
  //   const registeredPlugins = this[Symbol.for('registered-plugin')].includes(pluginName);
  //   console.log(registeredPlugins.find((p) => p.name === 'oauth'));
  //   // Return the plugin based on its name
  //   return registeredPlugins && registeredPlugins.find((p) => p.name === pluginName);
  // };
  console.log('Server built');
  // console.log(testApp.someSupport())
  return testApp;
}

/**
 * Description
 * @returns {any}
 */
async function close () {
  return new Promise((resolve, reject) => {
    testApp.close((err) => {
      if (err) reject(err);
       resolve();
    });
  });
  
}

function getTestApp() {
  return testApp;
}

module.exports = {
  config,
  build,
  close,
  getTestApp
};
