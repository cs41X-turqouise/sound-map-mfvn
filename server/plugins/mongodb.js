'use strict'

const fp = require('fastify-plugin')
const mongoose = require('mongoose')

module.exports = fp(async function (fastify, options) {
  // Log a message when the MongoDB connection is established
  mongoose.connection.on('connected', () => {
    fastify.log.info('MongoDB connection established!');
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    // uncomment to see all current files in the bucket
    // bucket.find({}).forEach((file) => {
    //   fastify.log.info(file);
    // });
    // uncomment to drop the bucket
    // bucket.drop((err, result) => {
    //   if (err) {
    //     fastify.log.error(err);
    //   }
    //   fastify.log.info(result);
    // });
    fastify.decorate('gridfs', bucket);
    fastify.decorate('toObjectId', (val) => new mongoose.Types.ObjectId(val));
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
});