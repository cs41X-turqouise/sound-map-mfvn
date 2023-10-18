'use strict'

const fp = require('fastify-plugin');
const csrf = require('@fastify/csrf');

module.exports = fp(async function(fastify, options) {

    const MissingCSRFSecretError = createError('FST_CSRF_MISSING_SECRET', 'Missing csrf secret', 403)
    const InvalidCSRFTokenError = createError('FST_CSRF_INVALID_TOKEN', 'Invalid csrf token', 403)

    fastify.register(csrf)

    fastify.post(
        '/',
        {
          preHandler: fastify.csrfProtection
        },
        async (req, reply) => {
          return req.body
        }
      )

    fastify.route({
        method: 'GET',
        url: '/',
        handler: async (req, reply) => {
            const token = await reply.generateCsrf();
            reply.type('text/html')
        }
    })

})