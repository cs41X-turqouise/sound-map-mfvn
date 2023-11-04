import fp from 'fastify-plugin';

/**
 * Important security headers for Fastify.
 * @see https://github.com/fastify/fastify-helmet
 */
export default fp(async function (fastify, opts) {
  fastify.register(import('@fastify/helmet'), {
    global: true,
  });
});
