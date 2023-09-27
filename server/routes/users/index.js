'use strict'

/**
 * 
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  /** @type {import("mongoose").Mongoose} */
  const mongoose = fastify.mongoose;

  const userSchema = new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String, 
      required: true,
      unique: true,
    },
  });

  const User = mongoose.model('User', userSchema);

  fastify.get('/', async function (request, reply) {
    const users = await User.find({});
    return users;
  })
  fastify.get('/:id', async function (request, reply) {
    const user = await User.findById(request.params.id);
    return user;
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
