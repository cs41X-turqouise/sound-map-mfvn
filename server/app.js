'use strict'

const path = require('path')
const AutoLoad = require('@fastify/autoload')

/**
 * @typedef {import('fastify').FastifyInstance} FastifyInstance
 */

// Pass --options via CLI arguments in command to enable these options.
module.exports.options = {}

/**
 * @param {FastifyInstance} fastify 
 * @param {Object} opts 
 */
module.exports = async function (fastify, opts) {
  // Place here your custom code!
  const envOptions = {
    confKey: 'config', // optional, default: 'config'
    schema: {
      type: 'object',
      required: ['PORT', 'MONGODB_URL', 'JWT_SECRET'],
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
        }
      }
    },
    // will read .env in root folder
    dotenv: {
      path: path.join(__dirname, (process.env.NODE_ENV === 'production') ? './prod.env' : './local.env'),
      debug: true
    }
  };
  await fastify.register(require('@fastify/env'), envOptions);

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
