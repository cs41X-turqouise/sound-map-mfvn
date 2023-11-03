import fp from 'fastify-plugin';
import Session from '@fastify/session';

export default fp(async function (fastify, options) {
  fastify.register(Session, {
    secret: 'FMMpiVXBnTJEJQIuQTtObXE5aLgfa3Pkdsfg897',
    cookie: {
      secure: process.env.NODE_ENV === 'production',
    },
    cookieName: 'user-session'
  });

  fastify.addHook('preHandler', (request, reply, done) => {
    request.session.user = request.session.user || null;
    done();
  });
});
