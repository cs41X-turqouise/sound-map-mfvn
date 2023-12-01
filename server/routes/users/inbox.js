import User from '../../models/User.js';
import { userSchema } from './schemas.js';
import { checkUserRole, verifyLoggedIn } from '../../utils/utils.js';

/**
 * @class InboxMessage
 */
export class InboxMessage {
  /**
   * @constructor
   * @param {string} title
   * @param {string} message
   * @param {Date} date
   * @param {import('../../models/User').User} sender
   */
  constructor (title, message, date, sender) {
    this.title = title;
    this.message = message;
    this.date = date;
    this.sender = sender;
  }
}

/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on users inboxes
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export async function inboxRoutes (fastify, options) {
  /**
   * Create a new message for a user
   */
  fastify.post('/:id/inbox', {
    preHandler: checkUserRole('moderator'),
    schema: {
      tags: ['inbox'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      body: {
        type: 'object',
        required: ['title', 'message'],
        properties: {
          title: { type: 'string' },
          message: { type: 'string' },
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

        const user = await User.findById(_id);
        if (!user) return reply.code(404).send(new Error('User not found'));

        const { title, message } = request.body;
        const sender = request.session.get('user')._id;

        const notification = new InboxMessage(title, message, Date.now(), sender);
        user.inbox.push(notification);
        await user.save();

        return user;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send('Internal Server Error');
      }
    },
  });

  /**
   * Delete message from user's inbox
   */
  fastify.delete('/:id/inbox/:mid', {
    preHandler: verifyLoggedIn,
    schema: {
      tags: ['inbox'],
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

        // Only allow deleting messages from your own inbox
        if (user._id.toString() !== request.session.get('user')._id.toString()) {
          return reply.code(403).send(new Error('Forbidden'));
        }

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
   * Delete all messages from user's inbox
   */
  fastify.delete('/:id/inbox', {
    preHandler: verifyLoggedIn,
    schema: {
      tags: ['inbox'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
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

        const user = await User.findById(_id);
        if (!user) return reply.code(404).send(new Error('User not found'));

        // Only allow deleting messages from your own inbox
        if (user._id.toString() !== request.session.get('user')._id.toString()) {
          return reply.code(403).send(new Error('Forbidden'));
        }

        /**
         * @todo - Figure out how to make this work, delete requests don't seem to parse the body
         * so messages is always undefined
         */
        // const messages = (request.body.messages || []).map((id) => fastify.toObjectId(id));
        // if (messages.length) {
        //   for (const message of user.inbox) {
        //     if (messages.includes(message._id)) {
        //       message.deleteOne();
        //     }
        //   }
        // } else {
        // }
        user.inbox = [];
        await user.save();

        return user;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send('Internal Server Error');
      }
    },
  });

  /**
   * Update read status of a message
   */
  fastify.patch('/:id/inbox/:mid', {
    preHandler: verifyLoggedIn,
    schema: {
      tags: ['inbox'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
          mid: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      body: {
        type: 'object',
        properties: {
          read: { type: 'boolean' },
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

        // Only allow updating messages from your own inbox
        if (user._id.toString() !== request.session.get('user')._id.toString()) {
          return reply.code(403).send(new Error('Forbidden'));
        }

        const message = user.inbox.id(_mid);
        if (!message) return reply.code(404).send(new Error('Message not found'));

        message.read = request.body.read;
        await user.save();

        return user;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send('Internal Server Error');
      }
    },
  });

  /**
   * Toggle read status of all messages
   * Optionally accepts array of message IDs to toggle
   */
  fastify.patch('/:id/inbox/toggleAll', {
    preHandler: verifyLoggedIn,
    schema: {
      tags: ['inbox'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      body: {
        type: 'object',
        required: ['read'],
        properties: {
          read: { type: 'boolean' },
          messages: {
            type: 'array',
            items: { type: 'string', description: 'MongoDB ObjectId' },
          },
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

        const user = await User.findById(_id);
        if (!user) return reply.code(404).send(new Error('User not found'));

        // Only allow updating messages from your own inbox
        if (user._id.toString() !== request.session.get('user')._id.toString()) {
          return reply.code(403).send(new Error('Forbidden'));
        }

        const messages = (request.body.messages || []).map((id) => fastify.toObjectId(id));
        for (const message of user.inbox) {
          if (!messages.length || messages.includes(message._id)) {
            message.read = request.body.read;
          }
        }
        await user.save();

        return user;
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send('Internal Server Error');
      }
    },
  });
}
