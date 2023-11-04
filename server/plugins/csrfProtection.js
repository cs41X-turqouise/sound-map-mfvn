import fp from 'fastify-plugin';

/**
 * This plugins enables usage of csrf protection.
 *
 * @see https://github.com/fastify/csrf-protection
 */
export default fp(async function (fastify, options) {
  fastify.register(import('@fastify/csrf-protection'), {
    sessionPlugin: '@fastify/session',
    getToken: (req) => {
      return req.headers['csrf-token'];
    }
  });
}, { name: 'csrf-protection' });
