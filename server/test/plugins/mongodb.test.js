import tap from 'tap';
import fastify from 'fastify';
import mongodb from '../../plugins/mongodb.js';

/**
 * These tests fail currently, todo - fix them as the actual plugin works.
 */
tap.test('MongoDB plugin', async (t) => {
  const server = fastify();

  server.register(mongodb, {
    // todo - use a test database
    MONGODB_URL: 'mongodb://localhost:27017/test',
  });

  // Wait for the MongoDB connection to be established
  await new Promise((resolve) => server.ready(resolve));

  // Test the decorated methods
  t.type(server.mongoose, 'object');
  t.type(server.gridfsSounds, 'object');
  t.type(server.gridfsImages, 'object');
  t.type(server.toObjectId, 'function');

  // Test the toObjectId method
  const stringId = '605c72ef689fcd3a841b8e71';
  const id = server.toObjectId(stringId);
  t.equal(id.toString(), stringId);

  // todo - test the GridFS buckets
  // todo - test the Mongoose client

  await server.close();
});
