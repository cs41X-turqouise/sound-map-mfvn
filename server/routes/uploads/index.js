'use strict'
/// <reference path="../../global.d.ts" />
/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on uploads
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  /**
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
      const userId = fastify.toObjectId(request.body.user);
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
      await upload.save();
      return upload;
    }
  )
  /**
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
  )
  /**
   * Get all uploads
   * @todo Implement this route
   */
  fastify.get('/', async function (request, reply) {
    // const uploads = await Upload.find({});
    // return uploads;
    // fastify.gridfs.find().
  })
  /**
   * Get a specific upload
   */
  fastify.get('/:id', async function (request, reply) {
    const _id = fastify.toObjectId(request.params.id);
    const fileDoc = await Sound.findById(_id).exec();
    const { file, fileStream } = await fileDoc.getFileStream(fastify);
    reply.header('Content-Type', 'application/octet-stream');
    // reply.header('Content-Type', file.contentType);
    return reply.send(fileStream);
    // reply.type(file.contentType);
    // reply.header('Content-Disposition', `attachment; filename="${file.filename}"`);
    // fileStream.pipe(reply.res);
    // reply.type(file.contentType).send(fileStream);
  })
  /**
   * Find user who uploaded a file
   */
  fastify.get('/:fileId/:userId', async function (request, reply) {
    const user = await Sound.findById(request.params.fileId)
      .populate('users')
      .findById(request.params.userId)
    return user;
  })
  /**
   * Delete a sound file
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
  })
  /**
   * Delete a image file
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
  })

  // Define a route for renaming files
  fastify.patch('/:id',
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
  // // Define a route for uploading files
  // fastify.post('/upload', async (request, reply) => {
  //   const file = request.raw.files.file; // Assuming you have a file input named 'file'

  //   // Create a GridFS write stream
  //   const uploadStream = fastify.gridfs.openUploadStream(file.filename);

  //   // Pipe the uploaded file data to the GridFS stream
  //   file.file.pipe(uploadStream);

  //   // Listen for the 'finish' event to know when the upload is complete
  //   uploadStream.once('finish', () => {
  //     reply.send('File uploaded successfully');
  //   });
  // });

  // // Define a route for downloading files
  // fastify.get('/download/:fileId', async (request, reply) => {
  //   const fileId = request.params.fileId;

  //   // Create a GridFS read stream
  //   const downloadStream = fastify.gridfs.openDownloadStream(ObjectId(fileId));

  //   // Pipe the file data to the response
  //   downloadStream.pipe(reply.res);
  // });
}
