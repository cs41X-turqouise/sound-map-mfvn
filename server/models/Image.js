/** @type {import("mongoose").Mongoose} */
const mongoose = require('mongoose');
/**
 * Mongoose schema for photo file uploads.
 *
 * @typedef {import("mongoose").Model} Images
 * @property {mongoose.Schema.Types.ObjectId} _id - The ID of the file uploaded to the GridFS bucket.
 * @property {mongoose.Schema.Types.ObjectId} soundFile - The ID of the sound file parent uploaded to the GridFS bucket.
 * @property {mongoose.Schema.Types.ObjectId} user - The ID of the user who uploaded the file.
 */
const uploadSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    soundFile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sounds',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },
  {
    methods: {
      /**
       * @typedef {import('fastify').FastifyInstance} FastifyInstance
       * @typedef {import('mongodb').GridFSBucketReadStream} GridFSBucketReadStream
       * @typedef {import('mongodb').GridFSFile} GridFSFile
       */
      /**
       * @param {FastifyInstance} fastify 
       * @returns {GridFSFile}
       */
      async getFile (fastify) {
        /** @type {GridFSFile[]} */
        const files = await fastify.gridfsImages.find({ _id: this._id }).toArray();
        return files[0];
      },
      /**
       * @param {FastifyInstance} fastify 
       * @returns {Promise<{fileStream: GridFSBucketReadStream, file: GridFSFile}>}
       */
      async getFileStream (fastify) {
        const file = await this.getFile(fastify);
        const fileStream = await fastify.gridfsImages.openDownloadStream(file._id);
        return {
          fileStream,
          file
        };
      }
    }
  }
);

module.exports = mongoose.model('images', uploadSchema);