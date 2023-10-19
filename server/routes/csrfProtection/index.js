'use strict'

module.exports = async function (fastify, options) {

    // Generate a token
    fastify.route({
        method: 'GET',
        path: '/',
        handler: async (req, reply) => {
            const token = await reply.generateCsrf()
            return { token }
        }
    })

    // Protect a route
    fastify.route({
        method: 'POST',
        path: '/',
        onRequest: fastify.csrfProtection,
        handler: async (req, reply) => {
            return req.body
        }
    })

}