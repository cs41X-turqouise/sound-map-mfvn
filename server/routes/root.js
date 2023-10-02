'use strict'

module.exports = async function (fastify, opts) {
  fastify.get('/', async function (request, reply) {
    return { root: 'Hello World' }
  })
}

const fastify = require('fastify')();
const uploadRoute = require('./uploads/index.js'); // Adjust the path as needed

fastify.register(uploadRoute);

// Add any other routes or plugins as necessary

fastify.listen(3001, (err) => {
  if (err) throw err;
  console.log('Server is running on http://localhost:3001');
});