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
      }),

      fastify.get('/protectedRoute', async (req, reply) => {
        try {
          await req.jwtVerify();

          const userId = req.user.id;
          const userName = req.user.name;
          const userPicture = req.user.picture;

          reply.send('User ID: ${userId}, Name: ${userName}, Picture: ${userPicture}');
        }
        catch(err) {
          reply.code(401).send({ error: 'Unauthorized: Unable to verify JWT token' });
        }
      });
}