'use strict';

import fp from 'fastify-plugin';
import mongoose from 'mongoose';

export default fp(async function (fastify, options) {
  // Log a message when the MongoDB connection is established
  mongoose.connection.on('connected', () => {
    fastify.log.info('MongoDB connection established!');
    const soundBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'sounds'
    });
    const imageBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images'
    });
    // uncomment to see all current files in the bucket
    // soundBucket.find({}).forEach((file) => {
    //   fastify.log.info(file);
    // });
    // imageBucket.find({}).forEach((file) => {
    //   fastify.log.info(file);
    // });
    // uncomment to drop the bucket
    // soundBucket.drop((err, result) => {
    //   if (err) {
    //     fastify.log.error(err);
    //   }
    //   fastify.log.info(result);
    // });
    // imageBucket.drop((err, result) => {
    //   if (err) {
    //     fastify.log.error(err);
    //   }
    //   fastify.log.info(result);
    // });
    fastify.decorate('gridfsSounds', soundBucket);
    fastify.decorate('gridfsImages', imageBucket);
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
