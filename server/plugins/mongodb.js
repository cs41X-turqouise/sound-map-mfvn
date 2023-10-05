'use strict'

const fp = require('fastify-plugin')
const mongoose = require('mongoose')
const { GridFSBucket, ObjectId } = require('mongodb');

module.exports = fp(async function (fastify, options) {
  // Log a message when the MongoDB connection is established
  mongoose.connection.on('connected', () => {
    fastify.log.info('MongoDB connection established!');
  });

  // Listen for the 'close' event on the Fastify instance and close the Mongoose connection
  fastify.addHook('onClose', async (instance) => {
    await mongoose.connection.close();
    fastify.log.info('MongoDB connection closed.');
  });

  // Connect to the MongoDB database using Mongoose
  await mongoose.connect(fastify.config.MONGODB_URL, {
    useNewUrlParser: true, useUnifiedTopology: true
  });

  // Decorate the Fastify instance with the Mongoose client
  fastify.decorate('mongoose', mongoose);

  // Access the GridFSBucket
  const bucket = new GridFSBucket(mongoose.connection.db);

  // Define a route for uploading files
  fastify.post('/upload', async (request, reply) => {
    const file = request.raw.files.file; // Assuming you have a file input named 'file'

    // Create a GridFS write stream
    const uploadStream = bucket.openUploadStream(file.filename);

    // Pipe the uploaded file data to the GridFS stream
    file.file.pipe(uploadStream);

    // Listen for the 'finish' event to know when the upload is complete
    uploadStream.once('finish', () => {
      reply.send('File uploaded successfully');
    });
  });

  // Define a route for downloading files
  fastify.get('/download/:fileId', async (request, reply) => {
    const fileId = request.params.fileId;

    // Create a GridFS read stream
    const downloadStream = bucket.openDownloadStream(ObjectId(fileId));

    // Pipe the file data to the response
    downloadStream.pipe(reply.res);
  });

  // Define a route for renaming files
  fastify.get('/upload/:fileID', async(request, reply) => {
    const fileID = request.params.fileId;
    const newFileName = request.params.newFileName;

    // Renames the file to new file name
    renameStream = bucket.rename(ObjectId(fileId), newFileName);

    // Listen for the 'finish' event to know when the rename is complete
    renameStream.once('finish', () => {
      reply.send("File renamed successfully to: " + newFileName);
    });
  });
});