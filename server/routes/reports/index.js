import User from '../../models/User.js';
import Sound from '../../models/Sound.js';
import Reports from '../../models/Reports.js';
import { reportSchema } from './schemas.js';
import { userSchema } from '../users/schemas.js';
import { verifyLoggedIn, checkUserRole } from '../../utils/utils.js';

/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on reports
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
  /**
   * Middleware for checking if user is logged in
   */
  fastify.addHook('onRequest', verifyLoggedIn);

  /**
   * Handle user reporting a file
   */
  fastify.post('/:id', {
    schema: {
      tags: ['reports'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      body: {
        type: 'object',
        required: ['reporter', 'reason'],
        properties: {
          reporter: { type: 'string', description: 'MongoDB ObjectId of the user' },
          reason: {
            type: 'string',
            description: 'Reason for reporting the file',
            minLength: 1,
            maxLength: 1000,
          },
        },
      },
      response: {
        200: reportSchema,
      },
    },
    async handler (request, reply) {
      try {
        const _id = fastify.toObjectId(request.params.id);
        if (!_id) return reply.code(400).send(new Error('Invalid ID'));
        const reporter = fastify.toObjectId(request.body.reporter);
        if (!reporter) return reply.code(400).send(new Error('Invalid User ID'));
        const reason = request.body.reason;

        const file = await Sound.findById(_id);
        if (!file) return reply.code(404).send(new Error('File not found'));

        const report = new Reports({
          reporter,
          fileId: _id,
          reason,
        });

        await report.save();
        return file;
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });

  /**
   * Get all reports in the database
   */
  fastify.get('/', {
    preHandler: checkUserRole('moderator'),
    schema: {
      tags: ['uploads'],
      response: {
        200: {
          type: 'array',
          items: reportSchema,
        },
      },
    },
    async handler (request, reply) {
      const reports = await Reports.find({});
      return reports;
    },
  });

  /**
   * Get a report by ID
   */
  fastify.get('/:id', {
    preHandler: checkUserRole('moderator'),
    schema: {
      tags: ['reports'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      response: {
        200: reportSchema,
      },
    },
    async handler (request, reply) {
      const _id = fastify.toObjectId(request.params.id);
      if (!_id) return reply.code(400).send(new Error('Invalid ID'));

      const report = await Reports.findById(_id);
      if (!report) return reply.code(404).send(new Error('Report not found'));

      return report;
    },
  });

  /**
   * Get user who filed a report
   */
  fastify.get('/:id/user', {
    preHandler: checkUserRole('moderator'),
    schema: {
      tags: ['reports'],
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
      const _id = fastify.toObjectId(request.params.id);
      if (!_id) return reply.code(400).send(new Error('Invalid ID'));

      const report = await Reports.findById(_id);
      if (!report) return reply.code(404).send(new Error('Report not found'));

      const user = await User.findById(report.userId);
      if (!user) return reply.code(404).send(new Error('User not found'));

      return user;
    },
  });

  /**
   * Delete a report by ID
   */
  fastify.delete('/:id', {
    preHandler: checkUserRole('moderator'),
    schema: {
      tags: ['reports'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
    },
    async handler (request, reply) {
      const _id = fastify.toObjectId(request.params.id);
      if (!_id) return reply.code(400).send(new Error('Invalid ID'));

      const report = await Reports.findByIdAndDelete(_id);
      if (!report) return reply.code(404).send(new Error('Report not found'));

      return reply.code(204).send();
    },
  });
}
