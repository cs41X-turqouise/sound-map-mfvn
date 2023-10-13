'use strict';  // Use JavaScript in "strict" mode to catch common bugs.
const jwt = require('@fastify/jwt');

module.exports = async function (fastify, options) {
    fastify.post('/generateToken', (req, reply) => {
      const user = {
        name: 'example Name',
        id: '123456',
        picture: 'defaultProfilePicture'
      };  
      const token = fastify.jwt.sign(user);
      reply.send({ token })
      })


      // Not sure if I'll need this or not
    /*fastify.post('/verify-token', async(req, reply) => {
      const { token } = request.body;

      try {
         const decoded = jwt.verify(token, secret);
         reply.send({ valid: true }, decoded);
        }
      catch(error) {
          reply.send({ valid:false });
        }
    })*/
}