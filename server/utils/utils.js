/**
 * @description General utility functions
 */

/**
 * @typedef {import("fastify").FastifyRequest} FastifyRequest
 * @typedef {import("fastify").FastifyReply} FastifyReply
 * @typedef {import("fastify").DoneFuncWithErrOrRes} DoneCallback
 */

/**
 * Checks for a valid user session
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @param {DoneCallback} done
 */
export function verifyLoggedIn (request, reply, done) {
  if (!request.session.get('user')) {
    done(new Error('User not logged in'));
  } else {
    done();
  }
}

/**
 * Checks if user is banned
 * @param {FastifyRequest} request
 * @param {FastifyReply} reply
 * @param {DoneCallback} done
 */
export function verifyNotBanned (request, reply, done) {
  if (request.session.get('user').banned) {
    done(new Error('User is banned'));
  } else {
    done();
  }
}

/**
 * @param {['admin'] | ['admin', 'moderator']} roles
 * @param {boolean} checkSelf
 */
export function checkUserRole (roles, checkSelf = false) {
  /**
   * @param {FastifyRequest} request
   * @param {FastifyReply} reply
   */
  return async function (request, reply) {
    /** @type {import('../../models/User.js').User} */
    const user = request.session.user;
    if (!user || (!roles.includes(user.role) && !(checkSelf && user._id === request.params.id))) {
      reply.code(403).send({ error: 'Forbidden' });
      return Promise.reject(new Error('Forbidden'));
    }
  };
}
