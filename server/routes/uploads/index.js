'use strict';
/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on uploads
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  /**
   * @typedef {import("../../global")}
   * @typedef {import("fastify").FastifyRequest} Request
   * @typedef {import("fastify").FastifyReply} Reply
   */
  const User = require('../../models/User');
  const Sound = require('../../models/Sound');
  const Image = require('../../models/Image');

  /**
   * User upload a file
   */
  fastify.post('/single',
    {
      preHandler: [
        function (request, reply, done) {
          if (!request.session.user) {
            done(new Error('User not logged in'));
          } else {
            done();
          }
        },
        fastify.upload.fields([
          { name: 'sound', maxCount: 1 },
          { name: 'images', maxCount: 12 },
        ]),
        function (request, reply, done) {
          if (!request.files) {
            done(new Error('File is required'));
          } else {
            done();
          }
        },
      ]
    },
    async function (request, reply) {
      fastify.log.info(request.files);
      const userId = fastify.toObjectId(request.session.user._id);
      const sound = request.files.sound[0];
      const images = [];
      if (request.files.images) {
        for (const image of request.files.images) {
          const upload = new Image({
            _id: fastify.toObjectId(image.id),
            soundFile: fastify.toObjectId(sound.id),
            user: userId,
          });
          await upload.save();
          images.push(upload._id);
        }
      }
      const upload = new Sound({
        images,
        user: userId,
        _id: fastify.toObjectId(sound.id),
      });
      request.session.user.uploads.push(upload._id);
      await request.session.user.save();
      await upload.save();
      sound.images = images;
      return sound;
    }
  );
  
  /**
   * Does not work
   * Allows users to upload an array of files
   * @todo We should be able to upload multiple sound files and corresponding images if any
   */
  fastify.post('/bulk',
    {
      preHandler: fastify.upload.array('files', 12)
    },
    /**
     * Handles the upload of multiple files.
     * @param {Request} request - The request object.
     * @param {Reply} reply - The reply object.
     * @returns {Array} An array of uploaded file objects.
     */
    async function (request, reply) {
      // Extract the user ID from the request body
      const userId = fastify.toObjectId(request.body.user);

      // Process file uploads concurrently using Promise.all and map by using Promise.all
      // in combination with map, the code is able to process multiple file uploads simultaneously
      const uploads = await Promise.all(request.files.map(async (file) => {
        // Create a new Upload object with file details and user ID
        const sound = request.files.sound[0];
        const upload = new Sound({
          ...request.file,
          user: userId,
          _id: fastify.toObjectId(sound.id),
        });
        // Save the Upload object to the database and return the result
        return await upload.save();
      }));

      // Return an array of uploaded file objects
      return uploads;
    }
  );

  /**
   * Get all uploads
   * 10/13/23 - Works but it's slow
   * @todo Speed this up
   */
  fastify.get('/', async function (request, reply) {
    const data = [];
    const uploads = await Sound.find({});
    for (const upload of uploads) {
      const { file, fileStream } = await upload.getFileStream(fastify);
      const buffer = await new Promise((resolve, reject) => {
        const chunks = [];
        fileStream.on('data', (chunk) => chunks.push(chunk));
        fileStream.on('error', reject);
        fileStream.on('end', () => resolve(Buffer.concat(chunks)));
      });
      data.push({
        file,
        buffer,
      });
    }
    return reply.send(data);
  });
  /**
   * Get a specific upload
   */
  fastify.get('/:id', async function (request, reply) {
    const _id = fastify.toObjectId(request.params.id);
    const fileDoc = await Sound.findById(_id).exec();
    const { file, fileStream } = await fileDoc.getFileStream(fastify);
    reply.header('Content-Type', file.contentType);
    return reply.send(fileStream);
  });
  /**
   * Get a specific upload
   */
  fastify.get('/image/:id', async function (request, reply) {
    const _id = fastify.toObjectId(request.params.id);
    const fileDoc = await Image.findById(_id).exec();
    const { file, fileStream } = await fileDoc.getFileStream(fastify);
    reply.header('Content-Type', file.contentType);
    return reply.send(fileStream);
  });
  fastify.get('/filedata/all', async function (request, reply) {
    const data = [];
    const uploads = await Sound.find({});
    for (const upload of uploads) {
      const file = await upload.getFile(fastify);
      // if (upload.images.length) {
      //   file.images = await Promise.all(upload.images.map(async (id) => {
      //     return await Image.getBuffer(fastify, id);
      //   }));
      //   file.images = [];
      //   for (const id of upload.images) {
      //     fastify.log.info(typeof id);
      //     file.images.push(await Image.getBuffer(fastify, id));
      //   }
      // }
      file.images = upload.images || [];
      data.push(file);
    }
    return reply.send(data);
  });

  /**
   * Find user who uploaded a file
   */
  fastify.get('/:fileId/:userId', async function (request, reply) {
    const user = await Sound.findById(request.params.fileId)
      .populate('users')
      .findById(request.params.userId);
    return user;
  });

  /**
   * Delete a sound file - should be Admin only or limited to the user themselves
   */
  fastify.delete('/sound/:id', async function (request, reply) {
    try {
      const _id = fastify.toObjectId(request.params.id);
      await fastify.gridfsSounds.delete(_id);
      const file = await Sound.findByIdAndDelete(_id);
      if (file.images) {
        // delete all associated images
        for (const image of file.images) {
          await fastify.gridfsImages.delete(_id);
          await Image.findByIdAndDelete(image);
        }
      }
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
  });

  /**
   * Delete a image file - should be Admin only or limited to the user themselves
   */
  fastify.delete('/image/:id', async function (request, reply) {
    try {
      const _id = fastify.toObjectId(request.params.id);
      await fastify.gridfsImages.delete(_id);
      const file = await Image.findByIdAndDelete(_id);
      const sound = await Sound.findById(file.soundFile);
      sound.images.pull(file._id);
      await sound.save();
      return file;
    } catch (err) {
      fastify.log.error(err);
    }
  });

  /**
   * Rename a file - should be Admin only or limited to the user themselves
   */
  fastify.patch('/filename/:id',
    {
      schema: {
        body: {
          type: 'object',
          required: ['newFileName'],
          properties: {
            newFileName: { type: 'string' },
          },
        },
      },
    },
    async function (request, reply) {
      const _id = fastify.toObjectId(request.params.id);
      const newFileName = request.body.newFileName;

      // Renames the file to new file name
      const file = await fastify.gridfsSounds.rename(_id, newFileName);
      // const file = await Upload.findByIdAndUpdate(_id, {
      //   filename: newFileName
      // }, { new: true });
      return file;
    }
  );

  /**
   * Update metadata of a file - should be Admin only or limited to the user themselves
   */
  fastify.patch('/metadata/:id',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            tags: { type: 'array' },
            latitude: { type: 'number' },
            longitude: { type: 'number' },
          },
        },
      },
    },
    async function (request, reply) {
      const _id = fastify.toObjectId(request.params.id);
      if (!Object.keys(request.body).length) {
        throw new Error('No metadata provided');
      }
      const oldFile = await fastify.mongoose.connection.db.collection('sounds.files').findOne({ _id: _id });
      const metadata = { ...oldFile.metadata, ...request.body };
      oldFile.metadata = metadata;
      const file = await fastify.mongoose.connection.db.collection('sounds.files').findOneAndUpdate(
        { _id },
        {
          $set: {
            metadata: metadata
          }
        },
        { returnOriginal: false }
      );
      return file;
    }
  );
};
