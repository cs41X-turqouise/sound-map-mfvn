'use strict'

// const dir = __dirname.replace('plugins', 'uploads\\');
const fp = require('fastify-plugin')
const multer = require('fastify-multer')
const { GridFsStorage } = require('@thebguy/multer-gridfs-storage')

module.exports = fp(async function (fastify, options) {
  fastify.register(multer.contentParser);
  
  const storage = new GridFsStorage({
    url: fastify.config.MONGODB_URL,
    file: function (req, file) {
      const filename = `${Date.now()}_${file.originalname}`;
      const fileInfo = {
        filename: filename,
        bucketName: 'uploads'
      };
      return fileInfo;
    }
  })

  storage.on('connection', (db) => {
    // Db is the database instance
    fastify.log.info('GRIDFS connection established!');
  });
  
  // storage.on('connectionFailed', (err) => {
  //   // err is the error received from MongoDb
  //   fastify.log.error(err);
  // });

  // storage.on('file', (file) => {
  //   // file is the file being uploaded
  //   fastify.log.info('GridFSFile - ', file);
  // });

  // storage.on('streamError', (err) => {
  //   // err is the error received from the GridFSBucketReadStream
  //   fastify.log.error(err);
  // });

  // storage.on('dbError', (err) => {
  //   // err is the error received from the MongoDB client
  //   fastify.log.error(err);
  // });

  // Decorate the Fastify instance
  fastify.decorate('upload', multer({ storage: storage }));
});