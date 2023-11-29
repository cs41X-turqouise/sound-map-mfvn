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

  fastify.io.on('connection', (socket) => {
    fastify.log.info(`Socket connected ${socket.id}`);

    // Getting error - MongoServerError: The $changeStream stage is only supported on replica sets
    // const collections = ['users', 'uploads', 'reports'];
    // collections.forEach((collection) => {
    //   const changeStream = mongoose.connection.collection(collection).watch();
    //   changeStream.on('change', () => {
    //     fastify.log.info(`${collection} changed`);
    //     fastify.io.emit(`${collection}Changed`);
    //   });

    //   socket.on('disconnect', () => {
    //     changeStream.close();
    //   });
    // });
  });

  // Decorate the Fastify instance with the Mongoose client
  fastify.decorate('mongoose', mongoose);
});
