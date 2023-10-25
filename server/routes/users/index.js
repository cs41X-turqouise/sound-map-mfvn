'use strict';

/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on users
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  const User = require('../../models/User');

  /**
   * Get all users
   * Should be Admin only
   */
  fastify.get('/', {
    schema: {
      tags: ['users'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', format: 'uuid' },
              username: { type: 'string' },
              fullname: { type: 'string' },
              email: { type: 'string', format: 'email' },
              gid: { type: 'string', format: 'uuid' },
              uploads: { type: 'array', items: { type: 'string', format: 'uuid' } },
              bookmarks: { type: 'array', items: { type: 'string', format: 'uuid' } },
            }
          }
        }
      }
    }
  }, async function (request, reply) {
    const users = await User.find({}).populate('uploads');
    return users;
  });

  /**
   * Get a single user by ID
   * Should be Admin only
   */
  fastify.get('/:id', async function (request, reply) {
    const user = await User.findById(request.params.id);
    return user;
  });

  /**
   * Get the currently logged in user
   */
  fastify.get('/self', async function (request, reply) {
    if (!request.session.user) {
      return reply.send(new Error('User not logged in'));
    }
    return request.session.user;
  });

  /**
   * Gets a file uploaded by a user
   * @todo Implement this or remove it
   */
  fastify.get('/:userId/:fileId', async function (request, reply) {
    return null;
  });

  /**
   * Create a new user
   */
  fastify.post('/', async function (request, reply) {
    try {
      const user = new User(request.body);
      await user.save();
      return user;
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send(err);
    }
  });

  /**
   * Delete a user - should be Admin only or limited to the user themselves
   */
  fastify.delete('/:id', async function (request, reply) {
    try {
      const user = await User.findByIdAndDelete(request.params.id);
      return user;
    } catch (err) {
      fastify.log.error(err);
    }
  });

  /**
   * Update a user
   */
  fastify.patch('/:id', async function (request, reply) {
    try {
      const user = await User.findByIdAndUpdate(request.params.id, request.body, { new: true });
      return user;
    } catch (err) {
      fastify.log.error(err);
    }
  });
};

