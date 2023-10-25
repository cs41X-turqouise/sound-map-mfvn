'use strict';
const fp = require('fastify-plugin');

/**
 * This plugins enables usage of csrf protection.
 *
 * @see https://github.com/fastify/csrf-protection
 */
module.exports = fp(async function (fastify, options) {
  fastify.register(require('@fastify/csrf-protection'), {
    sessionPlugin: '@fastify/session',
    getToken: (req) => {
      return req.headers['csrf-token'];
    }
  });
}), { name: 'csrf-protection' };
