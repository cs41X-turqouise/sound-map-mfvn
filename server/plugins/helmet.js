'use strict';

const fp = require('fastify-plugin');

/**
 * Important security headers for Fastify.
 * @see https://github.com/fastify/fastify-helmet
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/helmet'), {
    global: true,
  });
});
