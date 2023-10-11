'use strict';  // Use JavaScript in "strict" mode to catch common bugs.

module.exports = async function (fastify, options) {
    fastify.get('/generateToken', (req, reply) => {
      const user = {
        name:req.params.name,
        id:req.params.id,
        picture:req.params.picture
      };  

      const token = fastify.jwt.sign({ user })
      reply.send({ token })
      })
}