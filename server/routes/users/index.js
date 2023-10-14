'use strict'
/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on users
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  const User = require('../../models/User');

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
  fastify.get('/:userId/:fileId', async function (request, reply) {
    const file = await User.findById(request.params.userId)
      .populate('uploads')
      .findById(request.params.fileId)
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
  fastify.delete('/:id', async function (request, reply) {
    try {
      const user = await User.findByIdAndDelete(request.params.id);
      return user;
    } catch (err) {
      fastify.log.error(err);
    }
  })
}

