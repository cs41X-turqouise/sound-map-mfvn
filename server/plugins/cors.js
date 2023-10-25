'use strict';

const fp = require('fastify-plugin');

/**
 * enables the use of CORS in a Fastify application.
 * @see https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
 * @see https://github.com/fastify/fastify-cors
 */
module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/cors'), {
    origin: true,
    credentials: true
  });
});
