'use strict';

/**
 * @typedef {import('fastify').FastifyInstance} FastifyInstance
 */
export default async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: 'Hello World' };
  });
}
