'use strict';

import fp from 'fastify-plugin';
import Session from '@fastify/session';

export default fp(async function (fastify, options) {
  fastify.register(Session, {
    secret: 'FMMpiVXBnTJEJQIuQTtObXE5aLgfa3Pkdsfg897', // Place holder
    cookie: { secure: false }, //  Set secure to true in production
    cookieName: 'user-session'
  });

  fastify.addHook('preHandler', (request, reply, done) => {
    request.session.user = request.session.user || null;
    done();
  });
});
