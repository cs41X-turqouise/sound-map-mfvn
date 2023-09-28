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

  fastify.get('/', async function (request, reply) {
    const users = await User.find({}).populate('uploads');
    return users;
  })
  fastify.get('/:id', async function (request, reply) {
    const user = await User.findById(request.params.id);
    return user;
  })
  /**
   * Gets a file uploaded by a user
   */
  fastify.get('/:id/:id', async function (request, reply) {
    const file = await User.findById(request.params.id)
      .populate('uploads')
      .findById(request.params.id)
    // const fileStream = fs.createReadStream(file.path);
    // reply.type(file.mimetype).send(fileStream);
    return file;
  })
  fastify.post('/', async function (request, reply) {
    try {
      const user = new User(request.body);
      await user.save();
      return user;
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send(err);
    }
  })
  /**
   * Allows a user to upload a file
   */
  fastify.post('/:id/upload', 
    { preHandler: fastify.upload.single('file') },
    async function (request, reply) {
    const { filename, mimetype, path } = request.file;
    const upload = new Upload({
      filename,
      mimetype,
      path,
      user: request.params.id,
    });
    await upload.save();
    return upload;
  })
  fastify.delete('/:id', async function (request, reply) {
    try {
      const user = await User.findByIdAndDelete(request.params.id);
      return user;
    } catch (err) {
      fastify.log.error(err);
    }
  })
}

