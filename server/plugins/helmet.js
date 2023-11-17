import fp from 'fastify-plugin';

/**
 * Important security headers for Fastify.
 * @see https://github.com/fastify/fastify-helmet
 * @todo: Actually configure the options for helmet.
 */
export default fp(async function (fastify, opts) {
  fastify.register(import('@fastify/helmet'), {
    global: true,
  });
});
