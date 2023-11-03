/**
 * Root handler
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
  fastify.get('/', async function (request, reply) {
    return { root: 'Hello World' };
  });
}
