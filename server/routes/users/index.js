import User from '../../models/User.js';
import Sound from '../../models/Sound.js';
import Image from '../../models/Image.js';
import { userSchema } from './schemas.js';
import { uploadSchema } from '../uploads/schemas.js';

/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on users
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
  /**
   * @param {['admin'] | ['admin', 'moderator']} roles
   * @param {boolean} checkSelf
   */
  function checkUserRole (roles, checkSelf = false) {
    return async function (request, reply) {
      /** @type {import('../../models/User.js').User} */
      const user = request.session.user;
      if (!user || (!roles.includes(user.role) && !(checkSelf && user._id === request.params.id))) {
        reply.code(403).send({ error: 'Forbidden' });
        return Promise.reject(new Error('Forbidden'));
      }
    };
  }

  /**
   * Get all users
   * Should be Admin only
   */
  fastify.get('/', {
    preHandler: checkUserRole(['admin', 'moderator']),
    schema: {
      tags: ['users'],
      response: {
        200: {
          type: 'array',
          items: userSchema
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
  fastify.get('/:id', {
    preHandler: checkUserRole(['admin', 'moderator']),
    schema: {
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' }
        }
      },
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    const _id = fastify.toObjectId(request.params.id);
    if (!_id) return reply.code(400).send(new Error('Invalid ID'));
    const user = await User.findById(_id);
    return user;
  });

  /**
   * Get the currently logged in user
   */
  fastify.get('/self', {
    schema: {
      tags: ['users'],
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    if (!request.session.user) {
      return reply.send(new Error('User not logged in'));
    }
    return request.session.user;
  });

  /**
   * Gets a file uploaded by a user
   * @todo Implement this or remove it
   */
  fastify.get('/:uid/:fid', {
    schema: {
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          uid: { type: 'string', description: 'MongoDB ObjectId' },
          fid: { type: 'string', description: 'MongoDB ObjectId' }
        }
      },
      response: {
        200: {
          type: 'null',
        }
      }
    }
  }, async function (request, reply) {
    return null;
  });

  /**
   * Get all files uploaded by a specific user
   */
  fastify.get('/:userId/uploads', {
    preHandler: checkUserRole(['admin', 'moderator']),
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'MongoDB ObjectId of the user' },
        },
      },
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              ...uploadSchema.properties,
              images: {
                type: 'array',
                items: { type: 'string', description: 'MongoDB ObjectId' }
              },
            },
          },
        },
      },
    },
    async handler (request, reply) {
      try {
        const data = [];
        const userId = request.params.userId;
        const userObjectId = fastify.toObjectId(userId);
        if (!userObjectId) return reply.code(400).send(new Error('Invalid ID'));

        const uploads = await Sound.find({ user: userObjectId });
        for (const upload of uploads) {
          const file = await upload.getFile(fastify);
          file.images = upload.images || [];
          data.push(file);
        }
        return reply.send(data);
      } catch (error) {
        fastify.log.error(error);
        reply.code(500).send('Internal Server Error');
      }
    },
  });

  /**
   * Create a new user
   */
  fastify.post('/', {
    schema: {
      tags: ['users'],
      body: {
        type: 'object',
        required: ['username', 'fullname', 'email', 'gid'],
        properties: {
          username: { type: 'string' },
          fullname: { type: 'string' },
          email: { type: 'string', format: 'email' },
          gid: { type: 'string', description: 'Google Id' },
        }
      },
      response: {
        201: userSchema
      }
    }
  }, async function (request, reply) {
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
  fastify.delete('/:id', {
    preHandler: checkUserRole(['admin', 'moderator'], true),
    schema: {
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' }
        }
      },
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    try {
      const _id = fastify.toObjectId(request.params.id);
      if (!_id) return reply.code(400).send(new Error('Invalid ID'));

      const user = await User.findById(_id);

      // cannot delete admin if not admin
      if (user.role === 'admin' && request.session.user.role !== 'admin') {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const deletedUser = await user.deleteOne();

      // TODO - figure out way to destroy a user's session when they are deleted
      // if they are logged in, otherwise they will still be able to access the site
      // await fastify.mongoose.connection.db
      //   .collection('sesions')
      //   .findOneAndDelete({ 'user._id': _id });

      if (deletedUser.$isDeleted()) {
        // gotta delete all their uploads too
        for (const upload of deletedUser.uploads) {
          await fastify.gridfsSounds.delete(upload);
          const file = await Sound.findByIdAndDelete(upload);

          if (file.images) {
            // delete all associated images
            for (const image of file.images) {
              await fastify.gridfsImages.delete(image);
              await Image.findByIdAndDelete(image);
            }
          }
        }
      }
      return deletedUser;
    } catch (err) {
      fastify.log.error(err);
    }
  });

  /**
   * Update a user
   */
  fastify.patch('/:id', {
    schema: {
      tags: ['users'],
      body: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          fullname: { type: 'string' },
          email: { type: 'string', format: 'email' },
          gid: { type: 'string', description: 'Google Id' },
        }
      },
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    try {
      const _id = fastify.toObjectId(request.params.id);
      if (!_id) return reply.code(400).send(new Error('Invalid ID'));
      const user = await User.findByIdAndUpdate(_id, request.body, { new: true });
      return user;
    } catch (err) {
      fastify.log.error(err);
    }
  });

  // Update user role
  fastify.patch('/:id/role', {
    preHandler: checkUserRole(['admin', 'moderator']),
    schema: {
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' }
        }
      },
      body: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['moderator', 'admin', 'user'],
          },
        }
      },
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    try {
      const _id = fastify.toObjectId(request.params.id);
      if (!_id) return reply.code(400).send(new Error('Invalid ID'));
      const newRole = request.body.role; // Expect 'moderator' or 'admin'

      // cannot change own role
      if (request.session.user._id === _id) {
        return reply.code(403).send({ error: 'Forbidden' });
      }

      // cannot promote to admin if not admin
      if (newRole === 'admin' && request.session.user.role !== 'admin') {
        return reply.code(403).send({ error: 'Forbidden' });
      }
  
      // Update user role
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { role: newRole },
        { new: true, runValidators: true }
      );
  
      // Handle case where user does not exist
      if (!updatedUser) {
        return reply.code(404).send({ error: 'User not found' });
      }
  
      // Return the updated user
      return reply.code(200).send(updatedUser);
    } catch (error) {
      request.log.error(error); // Log the error for server-side inspection
      // Reply with a server error
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // Ban a user
  fastify.patch('/:id/ban', {
    preHandler: checkUserRole(['admin', 'moderator']),
    schema: {
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' }
        }
      },
      body: {
        type: 'object',
        required: ['ban'],
        properties: {
          ban: { type: 'boolean', description: 'true to ban, false to unban' },
        }
      },
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    const userId = fastify.toObjectId(request.params.id);
    if (!userId) return reply.code(400).send(new Error('Invalid ID'));
    const adminId = request.session.user._id; // ID of the admin performing the ban

    // cannot ban self
    if (userId === adminId) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // cannot ban other admins - should we have a superadmin role?
    if (user.role === 'admin') {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    // Update user ban status
    user.banned = request.body.ban;
    user.bannedBy = adminId;
    await user.save();

    return user;
  });
}
