/**
 * @description General utility functions
 */

/**
 * @typedef {import("fastify").FastifyRequest} FastifyRequest
 * @typedef {import("fastify").FastifyReply} FastifyReply
 * @typedef {import("fastify").DoneFuncWithErrOrRes} DoneCallback
 */

/**
 * @readonly
 * @enum {number}
 */
export const roles = Object.freeze({
  user: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4,
});

/**
 * Checks for a valid user session
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @param {DoneCallback} done
 */
export function verifyLoggedIn (request, reply, done) {
  request.session.get('user')
    ? done()
    : done(new Error('User not logged in'));
}

/**
 * Checks if user is banned
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @param {DoneCallback} done
 */
export function verifyNotBanned (request, reply, done) {
  request.session.get('user').banned
    ? done(new Error('User is banned'))
    : done();
}

/**
 * @param {'admin' | 'moderator' | 'user' | 'superadmin'} role
 * @param {boolean} checkSelf
 */
export function checkUserRole (role, checkSelf = false) {
  /**
   * @param {FastifyRequest} request
   * @param {FastifyReply} reply
   */
  return async function (request, reply) {
    /** @type {import('../../models/User.js').User} */
    const user = request.session.get('user');
    if (!user || (roles[user.role] < roles[role] && !(checkSelf && user._id === request.params.id))) {
      return reply.code(403).send({ error: 'Forbidden' });
    }
  };
}
