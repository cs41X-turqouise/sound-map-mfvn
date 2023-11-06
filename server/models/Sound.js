/** @type {import("mongoose").Mongoose} */
import mongoose from 'mongoose';
/**
 * Mongoose schema for sound file uploads.
 *
 * @typedef {import("mongoose").Model} Sounds
 * @property {mongoose.Schema.Types.ObjectId} _id - The ID of the file uploaded to the GridFS bucket.
 * @property {mongoose.Schema.Types.ObjectId} user - The ID of the user who uploaded the file.
 * @property {mongoose.Schema.Types.ObjectId} images - The ID(s) of the images uploaded to the GridFS bucket.
 */
const soundSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    images: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'images',
    }],
    compressed: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'sounds.files',
    }],
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
        const files = await fastify.gridfsSounds.find({ _id: this._id }).toArray();
        return files[0];
      },
      /**
       * @param {FastifyInstance} fastify
       * @returns {Promise<{fileStream: GridFSBucketReadStream, file: GridFSFile}>}
       */
      async getFileStream (fastify) {
        const file = await this.getFile(fastify);
        const fileStream = await fastify.gridfsSounds.openDownloadStream(file._id);
        return {
          fileStream,
          file
        };
      }
    }
  }
);

export default mongoose.model('sounds', soundSchema);
