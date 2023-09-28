'use strict'
// Fastify plugin that handels CRUD (Create, Read, Update, and Delete)
/**
 * 
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  /** @type {import("mongoose").Mongoose} */
  const mongoose = fastify.mongoose;

  /** @type {import("mongoose").Model} */
  const User = require('../../models/User');
  /** @type {import("mongoose").Model} */
  const Upload = require('../../models/Upload');

  /**
   * Get all uploads
   */
  fastify.get('/', async function (request, reply) {
    const uploads = await Upload.find({});
    return uploads;
  })
  /**
   * Get a specific upload
   */
  fastify.get('/:id', async function (request, reply) {
    const upload = await Upload.findById(request.params.id);
    return upload;
  })
  /**
   * Find user who uploaded a file
   */
  fastify.get('/:fileId/:userId', async function (request, reply) {
    const user = await Upload.findById(request.params.fileId)
      .populate('users')
      .findById(request.params.userId)
    return user;
  })
  /**
   * Delete a file
   */
  fastify.delete('/:id', async function (request, reply) {
    try {
      const file = await Upload.findByIdAndDelete(request.params.id);
      const users = await User.find({ uploads: file._id });

      // Remove the file ID from every user's uploads array
      for (const user of users) {
        user.uploads.pull(file._id);
        await user.save();
      }
      return file;
    } catch (err) {
      fastify.log.error(err);
    }
  })
}

