'use strict'

const fastify = require('fastify');
const fp = require('fastify-plugin')

module.exports = fp(async function (fastify, opts) {
  fastify.register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET
  })
});