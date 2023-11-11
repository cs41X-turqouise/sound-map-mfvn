import fp from 'fastify-plugin';
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
    // sessionKey: 'session',
    // cookieOpts: { signed: true },
    // getToken: (req) => {
    //   return req.headers['csrf-token'];
    // },
    // getUserInfo (req) {
    //   return req.session.user;
    // },
  });
}, {
  name: 'session',
  // oauth plugin must be registered before session plugin due to it internally registers the @fastify/cookie plugin
  dependencies: ['oauth'],
});
