import path from 'path';
import AutoLoad from '@fastify/autoload';
import FastifyEnv from '@fastify/env';
import fastifySocketIO from 'fastify-socket.io';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Pass --options via CLI arguments in command to enable these options.
export const options = {};

/**
 * @param {import('fastify').FastifyInstance} fastify
 * @param {Object} opts
 */
export default async function (fastify, opts) {
  /** @type {import('@fastify/env').FastifyEnvOptions} */
  const envOptions = {
    confKey: 'config',
    data: process.env,
    schema: {
      type: 'object',
      required: [
        'PORT',
        'MONGODB_URL',
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'COOKIE_SECRET',
        'SESSION_SECRET',
        'MONGOSTORE_SECRET',
        'ADMINS',
        'SUPERADMIN',
      ],
      properties: {
        PORT: {
          type: 'number',
          default: 3000
        },
        MONGODB_URL: {
          type: 'string',
          default: 'mongodb://127.0.0.1:27017/soundmap'
        },
        GOOGLE_CLIENT_ID: {
          type: 'string',
          default: '155453cr37'
        },
        GOOGLE_CLIENT_SECRET: {
          type: 'string',
          default: '155453cr37'
        },
        COOKIE_SECRET: {
          type: 'string',
        },
        SESSION_SECRET: {
          type: 'string',
        },
        MONGOSTORE_SECRET: {
          type: 'string',
        },
        ADMINS: {
          type: 'string',
          default: ''
        },
        SUPERADMIN: {
          type: 'string',
          default: ''
        },
      },
    },
    // will read .env in root folder
    dotenv: {
      path: path.join(__dirname, (process.env.NODE_ENV === 'production') ? './prod.env' : './local.env'),
      debug: true
    }
  };
  await fastify.register(FastifyEnv, envOptions);
  
  // convert ADMINS to array
  fastify.config.ADMINS = fastify.config.ADMINS.split(',').map((admin) => admin.trim());

  await fastify.register(fastifySocketIO, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  fastify.io.on('connection', (socket) => {
    fastify.log.info(`Socket connected ${socket.id}`);
  });

  // ~~~ Do not touch the following lines ~~~ //
  // loads all plugins defined in plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  });

  // loads all plugins defined in routes
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  });
}
