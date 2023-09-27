'use strict'

const fp = require('fastify-plugin')
const multer = require('fastify-multer')

module.exports = fp(async function (fastify, options) {
  fastify.register(multer.contentParser);
  const dir = __dirname.replace('plugins', 'uploads\\');
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, dir)
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now())
    }
  })

  // Decorate the Fastify instance
  fastify.decorate('upload', multer({ storage: storage }));
});