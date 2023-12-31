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

  fastify.get('/refresh', {
    onRequest: fastify.csrfCheck,
  }, async function (request, reply) {
    await request.session.regenerate();
    await reply.generateCsrf({ userInfo: request.session.user.fullname + request.session.user._id });

    reply.setCookie('xsrf-t', request.session._csrf, {
      secure: fastify.config.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true,
      signed: true,
      path: '/',
    });
    return { message: 'Refreshed' };
  });

  fastify.post('/test', {
    onRequest: fastify.csrfCheck,
  }, async function (request, reply) {
    return reply.send('Hello world');
  });

  fastify.get('/google/callback', {
    schema: {
      tags: ['auth'],
    },
    async handler (request, reply) {
      try {
        const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
        /**
         * @type {{ id: string, name: string, email: string, picture: string }}
         */
        const userInfo = await getUserInfo(token.token.access_token);
        let user = await User.findOne({ gid: userInfo.id })
          .populate('inbox.sender', 'username email')
          .exec();

        if (!user) {
          user = new User({
            gid: userInfo.id,
            fullname: userInfo.name,
            email: userInfo.email,
            profilePhoto: userInfo.picture,
            role: fastify.config.SUPERADMIN === userInfo.email
              ? 'superadmin'
              : fastify.config.ADMINS.includes(userInfo.email)
                ? 'admin'
                : 'user',
          });
          await user.save();
        }

        fastify.log.info(`User ${user.email} logged in`);

        request.session.user = user;
        await reply.generateCsrf({ userInfo: user.fullname.replace(/\s/g, '') + user._id.toString() });

        reply.setCookie('xsrf-t', request.session._csrf, {
          secure: fastify.config.NODE_ENV === 'production',
          httpOnly: true,
          sameSite: true,
          signed: true,
          path: '/',
        });

        return reply.redirect('http://localhost:5173/');
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });

  fastify.post('/logout', {
    onRequest: fastify.csrfCheck,
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
        await request.session.destroy();
        reply.clearCookie('sid');
        reply.clearCookie('xsrf-t');
        reply.clearCookie('oauth2-redirect-state');

        return reply.send('Logged out');
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });
}
