import path from 'path';
import AutoLoad from '@fastify/autoload';
import FastifyEnv from '@fastify/env';
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
      required: ['PORT', 'MONGODB_URL', 'JWT_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
      properties: {
        PORT: {
          type: 'number',
          default: 3000
        },
        MONGODB_URL: {
          type: 'string',
          default: 'mongodb://127.0.0.1:27017/soundmap'
        },
        JWT_SECRET: {
          type: 'string',
          default: '155453cr37'
        },
        GOOGLE_CLIENT_ID: {
          type: 'string',
          default: '155453cr37'
        },
        GOOGLE_CLIENT_SECRET: {
          type: 'string',
          default: '155453cr37'
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
