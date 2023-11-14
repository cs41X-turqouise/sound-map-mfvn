import User from '../../models/User.js';
import Sound from '../../models/Sound.js';
import { userSchema } from './schemas.js';
import { uploadSchema } from '../uploads/schemas.js';

/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on users
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
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
    preHandler: [],
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
      const user = await User.findByIdAndDelete(_id);
      return user;
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
      reply.code(200).send(updatedUser);
    } catch (error) {
      request.log.error(error); // Log the error for server-side inspection
      // Reply with a server error
      reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // Ban a user
  fastify.patch('/:id/ban', { }, async function (request, reply) {
    const userId = fastify.toObjectId(request.params.id);
    if (!userId) return reply.code(400).send(new Error('Invalid ID'));
    const adminId = request.session.user._id; // ID of the admin performing the ban
  
    const updatedUser = await User.findByIdAndUpdate(userId, {
      banned: true,
      bannedBy: adminId
    }, { new: true });
    return updatedUser;
  });
}
