import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import MongoStore from 'connect-mongo';

/**
 * A session plugin for fastify.
 * Enables usage of csrf protection.
 * @see https://github.com/fastify/session
 * @see https://github.com/fastify/fastify-cookie
 * @see https://github.com/fastify/csrf-protection
 */
export default fp(async function (fastify, options) {
  await fastify.register(fastifyCookie, {
    secret: fastify.config.COOKIE_SECRET || 'FMMpiVXBnTJEJQIuQTtObXE5aLgfa3Pkdsfg897',
  });
  await fastify.register(fastifySession, {
    secret: fastify.config.SESSION_SECRET || 'FMMpiVXBnTJEJQIuQTtObXE5aLgfa3Pkdsfg897',
    saveUninitialized: false,
    cookie: {
      secure: fastify.config.NODE_ENV === 'production',
      httpOnly: true,
    },
    cookieName: 'sid',
    expires: 1800000, // 30 minutes
    store: MongoStore.create({
      mongoUrl: fastify.config.MONGODB_URL,
      // stringify: false, // can't be used due to conflict `Unsupported BSON version, bson types must be from bson 6.x.x`
    })
  });

  await fastify.register(fastifyCsrfProtection, {
    sessionPlugin: '@fastify/session',
    // cookieOpts: { signed: true },
    getToken: (request) => {
      const csrf = request.unsignCookie(request.cookies['xsrf-t']);
      return csrf.value;
    },
    getUserInfo: (request) => {
      /** @type {string} */
      const fullname = request.session.get('user').fullname.replace(/\s/g, '');
      /** @type {string} */
      const _id = request.session.get('user')._id.toString();
      return fullname + _id;
    },
  });
}, {
  name: 'session',
  // dependencies: [],
});
