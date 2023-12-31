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
    cookieName: 'sid',
    cookie: {
      secure: fastify.config.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: MongoStore.create({
      mongoUrl: fastify.config.MONGODB_URL,
      autoRemove: 'native',
      crypto: {
        secret: fastify.config.MONGOSTORE_SECRET || 'FMMpiVXBnTJEJQIuQTtObXE5aLgfa3Pkdsfg897',
      },
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

  /** Hacky workaround because `fastify.crsfProtection still isn't working */
  fastify.decorate('csrfCheck', function (request, reply, done) {
    const csrf = request.unsignCookie(request.cookies['xsrf-t']);
    if (!request.session.get('user')) {
      return reply.code(403).send(new Error('Unauthorized'));
    } else if (!csrf.valid || csrf.value !== request.session.get('_csrf')) {
      return reply.code(403).send(new Error('Invalid CSRF token'));
    } else {
      done();
    }
  });
}, {
  name: 'session',
  // dependencies: [],
});
