import User from '../../models/User.js';
import Sound from '../../models/Sound.js';
import Image from '../../models/Image.js';
import { userSchema } from './schemas.js';
import { uploadSchema } from '../uploads/schemas.js';
import { checkUserRole, roles } from '../../utils/utils.js';

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
    preHandler: checkUserRole('moderator'),
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
    preHandler: checkUserRole('moderator'),
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
    const self = request.session.get('user');
    if (!self) {
      return reply.send(new Error('User not logged in'));
    }
    return self;
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
    preHandler: checkUserRole('moderator'),
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
    preHandler: checkUserRole('moderator', true),
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
   * Delete message from user's inbox
   */
  fastify.delete('/:id/inbox/:mid', {
    schema: {
      tags: ['users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
          mid: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      response: {
        200: userSchema,
      },
    },
    async handler (request, reply) {
      try {
        const _id = fastify.toObjectId(request.params.id);
        if (!_id) return reply.code(400).send(new Error('Invalid ID'));

        const _mid = fastify.toObjectId(request.params.mid);
        if (!_mid) return reply.code(400).send(new Error('Invalid Message ID'));

        const user = await User.findById(_id);
        if (!user) return reply.code(404).send(new Error('User not found'));

        const message = user.inbox.id(_mid);
        if (!message) return reply.code(404).send(new Error('Message not found'));

        message.deleteOne();
        await user.save();

        return user;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send('Internal Server Error');
      }
    },
  });

  /**
   * Update a user
   */
  fastify.patch('/:id', {
    preHandler: checkUserRole('moderator', true),
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
    preHandler: checkUserRole('moderator'),
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
      /** @type {User} */
      const self = request.session.get('user');
      
      // cannot change own role
      if (self._id === _id) {
        return reply.code(403).send({ error: 'Forbidden' });
      }
      /** @type {'user' | 'moderator' | 'admin'} */
      const newRole = request.body.role;

      // cannot promote user to a role higher than or equal to ourselves
      if (roles[newRole] >= roles[self.role]) {
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
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

  // Ban a user
  fastify.patch('/:id/ban', {
    preHandler: checkUserRole('moderator'),
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
    /** @type {User} */
    const self = request.session.get('user'); // User performing the ban

    // cannot ban self
    if (userId === self._id) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const user = await User.findById(userId);

    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // cannot ban users with roles higher than or equal to our own
    if (roles[user.role] >= roles[self.role]) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    // Update user ban status
    user.banned = request.body.ban;
    user.bannedBy = self._id;
    
    const notification = {
      title: 'Ban notification',
      message: `You have been ${user.banned ? 'banned' : 'unbanned'}`,
      date: Date.now(),
      sender: self._id,
    };
    user.inbox.push(notification);
    await user.save();

    return user;
  });
}
