'use strict';
const fp = require('fastify-plugin');

module.exports = fp(async function (fastify, options) {
  fastify.register(require('@fastify/csrf-protection'), {
    sessionPlugin: '@fastify/session',
    getToken: (req) => { return req.headers['csrf-token']}
  });
}), { name: 'csrf-protection' };
