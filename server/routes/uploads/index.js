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
  fastify.post('/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['file', 'user'],
          properties: {
            file: { type: 'object' },
            user: { type: 'string' },
          },
        },
      },
      preHandler: fastify.upload.single('file')
    },
    async function (request, reply) {
      fastify.log.info(request.file);
      const { filename, mimetype, path } = request.file;
      const userId = fastify.toObjectId(request.body.user);
      const upload = new Upload({
        filename,
        mimetype,
        path,
        user: userId,
      });
      await upload.save();
      return upload;
    }
  )
  /**
   * Allows users to upload an array of files
   */
  fastify.post('/bulk', 
    {
      schema: {
        body: {
          type: 'object',
          required: ['files', 'user'],
          properties: {
            files: { type: 'array' },
            user: { type: 'string' },
          },
        },
      },
      preHandler: fastify.upload.array('files', 12)
    },
    async function (request, reply) {
      // TODO: Handle multiple files
    }
  )
  /**
   * Get all uploads
   * @todo Implement this route
   */
  fastify.get('/', async function (request, reply) {
    // const uploads = await Upload.find({});
    // return uploads;
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

