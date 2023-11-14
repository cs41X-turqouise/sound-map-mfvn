import https from 'https';
import User from '../../models/User.js';

/**
 * Route handlers for the Google OAuth2 callback.
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
  const getUserInfo = (accessToken) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'www.googleapis.com',
        path: '/oauth2/v1/userinfo',
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(JSON.parse(data));
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.end();
    });
  };
  fastify.get('/google/callback', {
    schema: {
      tags: ['auth'],
    },
    async handler (request, reply) {
      try {
        const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        const userInfo = await getUserInfo(token.token.access_token);
        let user = await User.findOne({ gid: userInfo.id });

        if (!user) {
          user = new User({
            gid: userInfo.id,
            username: userInfo.name,
            fullname: userInfo.name,
            email: userInfo.email,
            profilePhoto: userInfo.picture,
            role: fastify.config.ADMINS.includes(userInfo.email) ? 'admin' : 'user',
          });
          await user.save();
        }

        request.session.user = user;
        reply.redirect('http://localhost:5173/');
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });

  fastify.post('/logout', {
    schema: {
      tags: ['auth'],
      response: {
        200: {
          type: 'string',
          description: 'Logout message',
        },
      },
    },
    async handler (request, reply) {
      try {
        request.session.destroy();
        reply.send('Logged out');
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });
}
