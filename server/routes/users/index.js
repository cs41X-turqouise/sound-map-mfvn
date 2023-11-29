import User from '../../models/User.js';
import Sound from '../../models/Sound.js';
import { userSchema } from './schemas.js';
import { uploadSchema } from '../uploads/schemas.js';
import { checkUserRole, roles, verifyLoggedIn } from '../../utils/utils.js';
import { InboxMessage, inboxRoutes } from './inbox.js';

/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on users
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
  fastify.register(inboxRoutes);
  
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
    return reply.send(users);
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
    return reply.send(user);
  });

  /**
   * Get the currently logged in user
   */
  fastify.get('/self', {
    preHandler: verifyLoggedIn,
    schema: {
      tags: ['users'],
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    const self = request.session.get('user');
    const newSelf = await User.findById(self._id)
      .populate('inbox.sender', 'username email')
      .exec();
    if (!newSelf) {
      await fastify.inject({ method: 'POST', url: '/auth/logout' });
      return reply.code(404).send({ error: 'User not found' });
    }

    request.session.set('user', newSelf);
    return reply.send(newSelf);
  });

  /**
   * Get and refresh the currently logged in user
   */
  fastify.get('/self/refresh', {
    preHandler: verifyLoggedIn,
    schema: {
      tags: ['users'],
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    const self = request.session.get('user');
    const newSelf = await User.findById(self._id)
      .populate('inbox.sender', 'username email')
      .exec();
    request.session.set('user', newSelf);
    return reply.send(newSelf);
  });

  /**
   * Get all files uploaded by a specific user
   */
  fastify.get('/:id/uploads', {
    preHandler: checkUserRole('moderator', true),
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId of the user' },
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
        const userId = request.params.id;
        const userObjectId = fastify.toObjectId(userId);
        if (!userObjectId) return reply.code(400).send(new Error('Invalid ID'));

        const uploads = await Sound.find({ user: userObjectId });
        for (const upload of uploads) {
          const file = await upload.getFile(fastify);
          file.images = upload.images || [];
          file.visible = upload.visible;
          file.approvedBy = upload.approvedBy;

          if (file.metadata.creator) {
            const creator = fastify.toObjectId(file.metadata.creator);
            file.metadata.creator = await User.findById(creator, 'username').exec();
          } else {
            file.metadata.creator = { username: 'Unknown' };
          }
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
   * Get all bookmarks for a specific user
   * Limited to the user themselves
   */
  fastify.get('/:id/bookmarks', {
    preHandler: verifyLoggedIn,
    schema: {
      tags: ['bookmarks'],
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
        const userId = request.params.id;
        const userObjectId = fastify.toObjectId(userId);
        if (!userObjectId) return reply.code(400).send(new Error('Invalid ID'));

        if (userObjectId.toString() !== request.session.get('user')._id.toString()) {
          return reply.code(403).send({ error: 'Forbidden' });
        }

        const user = await User.findById(userObjectId);
        if (!user) return reply.code(404).send({ error: 'User not found' });

        for (const bookmark of user.bookmarks) {
          const upload = await Sound.findById(bookmark);
          if (!upload || !upload.visible) continue;

          const file = await upload.getFile(fastify);
          file.images = upload.images || [];
          file.visible = upload.visible;
          file.approvedBy = upload.approvedBy;

          if (file.metadata.creator) {
            const creator = fastify.toObjectId(file.metadata.creator);
            file.metadata.creator = await User.findById(creator, 'username').exec();
          } else {
            file.metadata.creator = { username: 'Unknown' };
          }
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
      return reply.send(user);
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
          try {
            await fastify.inject({
              method: 'DELETE',
              url: `/uploads/sound/${upload}`,
              headers: request.headers,
              query: request.query,
              params: request.params,
              body: request.body
            });
          } catch (error) {
            fastify.log.error(error);
          }
        }
      }
      return reply.send(deletedUser);
    } catch (err) {
      fastify.log.error(err);
    }
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
      
      // TODO - Implement socket.io to update all clients when a user is updated
      // Currnetly this works for updating the currently logged in user - but others won't see the changes until they refresh
      if (_id === request.session.get('user')._id) {
        request.session.set('user', user);
      }
      
      return reply.send(user);
    } catch (err) {
      fastify.log.error(err);
      if (err.message.includes('duplicate key error')) {
        return reply.code(400).send({ error: 'Already in use' });
      }
      return reply.internalServerError();
    }
  });

  /**
   * Add/Remove a bookmarked sound from a user's bookmarks
   */
  fastify.patch('/:id/bookmarks', {
    preHandler: verifyLoggedIn,
    schema: {
      tags: ['bookmarks'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId of the user' },
        },
      },
      body: {
        type: 'object',
        required: ['bookmark', 'id'],
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId of the sound' },
          bookmark: { type: 'boolean', description: 'true to add, false to remove' },
        },
      },
      response: {
        200: userSchema
      }
    }
  }, async function (request, reply) {
    try {
      const soundId = fastify.toObjectId(request.body.id);
      if (!soundId) return reply.code(400).send(new Error('Invalid ID'));

      /** @type {User} */
      const self = request.session.get('user');
      const userId = fastify.toObjectId(request.params.id);
      if (!userId) return reply.code(400).send(new Error('Invalid ID'));

      // cannot add or remove bookmarks for other users
      if (userId.toString() !== self._id.toString()) {
        fastify.log.error(`
          Cannot add or remove bookmarks for other users
          User ID: ${userId} !== ${self._id}
        `);
        return reply.code(403).send({ error: 'Forbidden' });
      }

      const user = await User.findById(self._id);
      if (!user) return reply.code(404).send({ error: 'User not found' });

      if (user.bookmarks.includes(soundId) && request.body.bookmark) {
        return reply.code(409).send({ error: 'Already bookmarked' });
      }
      // add or remove the bookmark
      if (!user.bookmarks.includes(soundId) && request.body.bookmark) {
        user.bookmarks.push(soundId);
      } else if (user.bookmarks.includes(soundId) && !request.body.bookmark) {
        user.bookmarks.pull(soundId);
      }

      await user.save();
      return reply.send(user);
    } catch (error) {
      fastify.log.error(error);
      reply.code(500).send('Internal Server Error');
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
          reason: { type: 'string', description: 'Reason for role change' },
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

      const user = await User.findById(_id);
  
      // Handle case where user does not exist
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // Update user role
      const updatedUser = await User.findByIdAndUpdate(
        _id,
        { role: newRole },
        { new: true, runValidators: true }
      );

      const roleChangeType = roles[newRole] < roles[user.role] ? 'demoted' : 'promoted';
      const notification = new InboxMessage(
        `[Role Change] You have been ${roleChangeType}`,
        request.body.reason,
        Date.now(),
        self._id
      );
      updatedUser.inbox.push(notification);
      await updatedUser.save();
  
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
          reason: { type: 'string', description: 'Reason for ban or unban' },
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
    
    const notification = new InboxMessage(
      `[Ban] You have been ${user.banned ? 'banned' : 'unbanned'}`,
      request.body.reason,
      Date.now(),
      self._id
    );
    user.inbox.push(notification);
    await user.save();

    return reply.send(user);
  });
}
