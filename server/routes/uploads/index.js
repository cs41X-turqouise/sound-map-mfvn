'use strict'
/// <reference path="../../global.d.ts" />
// Fastify plugin that handels CRUD (Create, Read, Update, and Delete)
/**
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  /** @type {import("mongoose").Model} */
  const User = require('../../models/User');
  /** @type {import("mongoose").Model} */
  const Upload = require('../../models/Upload');

  /**
   * User upload a file
   */
  fastify.post('/single',
    {
      // schema: {
      //   body: {
      //     type: 'object',
      //     required: ['user'],
      //     properties: {
      //       user: { type: 'string' },
      //     },
      //   },
      // },
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
      // fastify.log.info(request.body);
      const userId = fastify.toObjectId(request.body.user);
      const images = [];
      if (request.files.images) {
        for (const image of request.files.images) {
          const upload = new Upload({
            ...image,
            user: userId,
          });
          await upload.save();
          fastify.log.info(upload);
          images.push(upload._id);
        }
      }
      const upload = new Upload({
        ...request.files.sound[0],
        // images, // TODO: fix this as this seems hacky, each image would have it's own empty images array
        user: userId,
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
      // schema: {
      //   body: {
      //     type: 'object',
      //     required: ['user'],
      //     properties: {
      //       user: { type: 'string' },
      //     },
      //   },
      // },
      preHandler: fastify.upload.array('files', 12)
    },
    /**
     * Handles the upload of multiple files.
     * @param {Object} request - The request object.
     * @param {Object} reply - The reply object.
     * @returns {Array} An array of uploaded file objects.
     */
    async function (request, reply) {
      // Extract the user ID from the request body
      const userId = fastify.toObjectId(request.body.user);

       // Process file uploads concurrently using Promise.all and map by using Promise.all
       // in combination with map, the code is able to process multiple file uploads simultaneously
      const uploads = await Promise.all(request.files.map(async (file) => {

        // Create a new Upload object with file details and user ID
        const upload = new Upload({
          ...request.file,
          user: userId,
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
    fastify.log.info(request.params.id);
    fastify.gridfs.find({ _id: request.params.id }).toArray((err, files) => {
      if (!files || files.length === 0) {
        return reply.send(new Error('No file found'));
      }
      fastify.gridfs.openDownloadStream(files[0]._id).pipe(reply.res);
    });
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

  // Define a route for renaming files
  // fastify.get('/upload/:fileID', async(request, reply) => {
  //   const fileID = request.params.fileId;
  //   const newFileName = request.params.newFileName;

  //   // Renames the file to new file name
  //   renameStream = fastify.gridfs.rename(ObjectId(fileId), newFileName);

  //   // Listen for the 'finish' event to know when the rename is complete
  //   renameStream.once('finish', () => {
  //     reply.send("File renamed successfully to: " + newFileName);
  //   });
  // });
}
