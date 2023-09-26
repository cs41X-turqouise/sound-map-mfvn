'use strict'

const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  await fastify.register(require('@fastify/mongodb'), {
    url: fastify.config.MONGODB_URL,
    forceClose: true,
  })
  fastify.ready(err => {
    if (err) throw err;
    console.log('MongoDB connection established!');
  });
})