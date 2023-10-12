'use strict';  // Use JavaScript in "strict" mode to catch common bugs.

module.exports = async function (fastify, options) {
    fastify.get('/generateToken', (req, reply) => {
      user = {
        name: {
          type: 'string',
          default: "John Doe"
        },
        id: {
          type: 'string',
          default: '123456'
        },
        picture: {
          type: 'file',
          default: '../client/src/assets/default-avatar.png'
        }
      };  

      const token = fastify.jwt.sign({ user })
      reply.send({ token })
      })
}