import fp from 'fastify-plugin';
import Cors from '@fastify/cors';

/**
 * enables the use of CORS in a Fastify application.
 * @see https://en.wikipedia.org/wiki/Cross-origin_resource_sharing
 * @see https://github.com/fastify/fastify-cors
 */
export default fp(async function (fastify, opts) {
  fastify.register(Cors, {
    origin: true,
    credentials: true
  });
});
