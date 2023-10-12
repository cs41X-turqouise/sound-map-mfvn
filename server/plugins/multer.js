'use strict'

const fp = require('fastify-plugin')
const multer = require('fastify-multer')
const { GridFsStorage } = require('@thebguy/multer-gridfs-storage')

module.exports = fp(async function (fastify, options) {
  fastify.register(multer.contentParser);
  
  const storage = new GridFsStorage({
    url: fastify.config.MONGODB_URL,
    /**
     * @param {Request} req 
     * @param {import("@thebguy/multer-gridfs-storage").GridFile} file 
     */
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const filename = `${Date.now()}_${file.originalname}`;
        const isAudio = file.mimetype.match(/^audio\//);
        const fileInfo = {
          filename: filename,
          originalname: file.originalname,
          bucketName: (isAudio ? 'sounds' : 'images')
        };
        if (isAudio) {
          fileInfo.metadata = {
            ...req.body,
          };
        }
        resolve(fileInfo);
      });
    }
  })

  storage.on('connection', (db) => {
    // Db is the database instance
    fastify.log.info('GRIDFS connection established!');
  });

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