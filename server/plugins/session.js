'use strict';
const fp = require('fastify-plugin');

module.exports = fp( async function (fastify, options) {
  fastify.register(require('@fastify/session'), {
    secret: 'FMMpiVXBnTJEJQIuQTtObXE5aLgfa3Pkdsfg897', // Place holder
    cookie: { secure: false }, //  Set secure to true in production
    cookieName: 'user-session'
  });

  fastify.addHook('preHandler', (request, reply, done) => {
    request.session.user = request.session.user || null;
    done();
  });
}
);

