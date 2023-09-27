'use strict'

/**
 * 
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  const fs = require('fs');

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
    uploads: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Upload',
    }],
  });

  const uploadSchema = new mongoose.Schema({
    filename: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  });

  const User = mongoose.model('User', userSchema);
  const Upload = mongoose.model('Upload', uploadSchema);

  fastify.get('/', async function (request, reply) {
    const users = await User.find({});
    return users;
  })
  fastify.get('/:id', async function (request, reply) {
    const user = await User.findById(request.params.id).populate('uploads');
    return user;
  })
  fastify.get('/:id/:filename', async function (request, reply) {
    const file = await User.findById(request.params.id)
      .populate('uploads')
      .find({ filename: request.params.filename });
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
