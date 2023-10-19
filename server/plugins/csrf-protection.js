'use strict';
const fp = require('fastify-plugin');

/**
 * registers the OAuth2 configuration for Google authentication.
 */
module.exports = fp(async function (fastify, options) {
  // Register the Fastify OAuth2 plugin.
  fastify.register(require('@fastify/csrf-protection'), {
    
  });
}, { name: 'csrf-protection' });
