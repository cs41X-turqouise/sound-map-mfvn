'use strict';

const fp = require('fastify-plugin');

/**
 * A Fastify plugin for serving Swagger (OpenAPI v2) or OpenAPI v3 schemas,
 * which are automatically generated from your route schemas, or from an existing Swagger/OpenAPI schema.
 * @see https://github.com/fastify/fastify-swagger
 * @see https://github.com/fastify/fastify-swagger-ui
 */
module.exports = fp(async function (fastify, opts) {
  await fastify.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Sound Map Documentation',
        description: 'Sound Map Backend Documentation description',
        version: '0.0.0'
      },
      host: 'localhost',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      basePath: '',
      tags: [
        { name: 'users', description: 'User related end-points' },
        { name: 'auth', description: 'Auth related end-points' },
        { name: 'uploads', description: 'Upload related end-points' },
      ],
      definitions: {
        User: {
          type: 'object',
          required: ['_id', 'username', 'gid', 'email'],
          properties: {
            _id: { type: 'string', format: 'uuid' },
            username: { type: 'string' },
            fullname: { type: 'string' },
            email: { type: 'string', format: 'email' },
            gid: { type: 'string', format: 'uuid' },
            uploads: { type: 'array', items: { type: 'string', format: 'uuid' } },
            bookmarks: { type: 'array', items: { type: 'string', format: 'uuid' } },
          }
        },
        Sound: {
          type: 'object',
          required: ['_id', 'user', 'images'],
          properties: {
            _id: { type: 'string', format: 'uuid' },
            user: { type: 'string', format: 'uuid' },
            images: { type: 'array', items: { type: 'string', format: 'uuid' } },
          },
        },
        Image: {
          type: 'object',
          required: ['_id', 'soundFile', 'user'],
          properties: {
            _id: { type: 'string', format: 'uuid' },
            soundFile: { type: 'string', format: 'uuid' },
            user: { type: 'string', format: 'uuid' },
          },
        },
      },
    }
  });
  // Register Fastify Swagger UI plugin with configuration
  fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs', // Route to access Swagger UI http://127.0.0.1:3000/docs/
    uiConfig: {
      docExpansion: 'none', // How the documentation is initially displayed (none/list/full)
      deepLinking: true // Enable deep linking
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next();
      },
      preHandler: function (request, reply, next) {
        next();
      }
    },
    staticCSP: false, // Disable static content security policy
    transformStaticCSP: (header) => header, // Transformation function for static content security policy
    exposeRoute: true // Expose the route
  });
});
