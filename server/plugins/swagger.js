import fp from 'fastify-plugin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { version } = JSON.parse(readFileSync(join(__dirname, '../package.json')));

/**
 * A Fastify plugin for serving Swagger (OpenAPI v2) or OpenAPI v3 schemas,
 * which are automatically generated from your route schemas, or from an existing Swagger/OpenAPI schema.
 * @see https://github.com/fastify/fastify-swagger
 * @see https://github.com/fastify/fastify-swagger-ui
 */
export default fp(async function (fastify, opts) {
  await fastify.register(import('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Sound Map Documentation',
        description: 'Sound Map Backend Documentation description',
        version: version
      },
      host: '127.0.0.1:3000',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      basePath: '',
      tags: [
        { name: 'users', description: 'User related end-points' },
        { name: 'inbox', description: 'User inbox related end-points' },
        { name: 'bookmarks', description: 'User bookmarks related end-points' },
        { name: 'auth', description: 'Auth related end-points' },
        { name: 'uploads', description: 'Upload related end-points' },
        { name: 'reports', description: 'Report related end-points' },
      ],
      definitions: {
        User: {
          type: 'object',
          required: ['_id', 'username', 'gid', 'email', 'uploads', 'bookmarks', 'role', 'banned'],
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            fullname: { type: 'string' },
            email: { type: 'string', format: 'email' },
            gid: { type: 'string' },
            profilePhoto: { type: 'string' },
            joined: { type: 'string', format: 'date-time' },
            uploads: { type: 'array', items: { type: 'string' } },
            bookmarks: { type: 'array', items: { type: 'string' } },
            role: { type: 'string', enum: ['user', 'moderator', 'admin', 'superadmin'] },
            banned: { type: 'boolean' },
          }
        },
        Sound: {
          type: 'object',
          required: ['_id', 'visible', 'approvedBy', 'user', 'images'],
          properties: {
            _id: { type: 'string' },
            visible: { type: 'boolean' },
            approvedBy: { type: 'string' },
            user: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
          },
        },
        Report: {
          type: 'object',
          required: ['_id', 'reporter', 'fileId', 'reason', 'viewableBy', 'date'],
          properties: {
            _id: { type: 'string' },
            reporter: { type: 'string' },
            fileId: { type: 'string' },
            reason: { type: 'string' },
            viewableBy: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
          },
        },
        Image: {
          type: 'object',
          required: ['_id', 'soundFile', 'user'],
          properties: {
            _id: { type: 'string' },
            soundFile: { type: 'string' },
            user: { type: 'string' },
          },
        },
      },
    },
    exposeRoute: fastify.config.NODE_ENV !== 'production',
  });

  // For development only
  if (fastify.config.NODE_ENV !== 'production') {
    // Register Fastify Swagger UI plugin with configuration
    fastify.register(import('@fastify/swagger-ui'), {
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
      transformSpecification: (swaggerObject, request, reply) => {
        return swaggerObject;
      },
    });
  }
});
