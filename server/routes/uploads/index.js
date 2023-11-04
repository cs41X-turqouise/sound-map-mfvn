import User from '../../models/User.js';
import Sound from '../../models/Sound.js';
import Image from '../../models/Image.js';
import { uploadSchema } from './schemas.js';
import { userSchema } from '../users/schemas.js';

/**
 * Routes for handling CRUD (Create, Read, Update, and Delete) operations on uploads
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
  /**
   * User upload a file
   */
  fastify.post('/single',
    {
      preHandler: [
        function (request, reply, done) {
          if (!request.session.user) {
            done(new Error('User not logged in'));
          } else {
            done();
          }
        },
        fastify.upload.fields([
          { name: 'sound', maxCount: 1 },
          { name: 'images', maxCount: 12 },
        ]),
        function (request, reply, done) {
          if (!request.files) {
            done(new Error('File is required'));
          } else {
            done();
          }
        },
      ],
      schema: {
        tags: ['uploads'],
        response: {
          201: uploadSchema,
        },
      },
      async handler (request, reply) {
        fastify.log.info(request.files);
        const userId = fastify.toObjectId(request.session.user._id);
        const sound = request.files.sound[0];
        const images = [];

        if (request.files.images) {
          for (const image of request.files.images) {
            const upload = new Image({
              _id: fastify.toObjectId(image.id),
              soundFile: fastify.toObjectId(sound.id),
              user: userId,
            });
            await upload.save();
            images.push(upload._id);
          }
        }

        const upload = new Sound({
          images,
          user: userId,
          _id: fastify.toObjectId(sound.id),
        });
        request.session.user.uploads.push(upload._id);

        await request.session.user.save();
        await upload.save();

        // return sound;
        reply.code(201).send(sound);
      }
    }
  );
  
  /**
   * Does not work
   * Allows users to upload an array of files
   * @todo We should be able to upload multiple sound files and corresponding images if any
   */
  fastify.post('/bulk', {
    schema: {
      tags: ['uploads'],
      response: {
        501: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
      },
    },
    async handler (request, reply) {
      reply.code(501).send({ error: 'Not Implemented' });
    }
  });

  /**
   * Get all uploads
   * 10/13/23 - Works but it's slow
   * @todo Speed this up
   */
  fastify.get('/', {
    schema: {
      tags: ['uploads'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              file: uploadSchema,
              buffer: { type: 'string', format: 'byte' }
            },
          },
        },
      },
    },
    async handler (request, reply) {
      const data = [];
      const uploads = await Sound.find({});
      for (const upload of uploads) {
        const { file, fileStream } = await upload.getFileStream(fastify);
        const buffer = await new Promise((resolve, reject) => {
          const chunks = [];
          fileStream.on('data', (chunk) => chunks.push(chunk));
          fileStream.on('error', reject);
          fileStream.on('end', () => resolve(Buffer.concat(chunks)));
        });
        data.push({
          file,
          buffer,
        });
      }
      return reply.send(data);
    },
  });

  /**
   * Get all the file data from the sounds bucket
   */
  fastify.get('/filedata/all', {
    schema: {
      tags: ['uploads'],
      response: {
        200: {
          type: 'array',
          items: uploadSchema,
        },
      },
    },
    async handler (request, reply) {
      const data = [];
      const uploads = await Sound.find({});
      for (const upload of uploads) {
        const file = await upload.getFile(fastify);
        data.push(file);
      }
      return reply.send(data);
    },
  });

  /**
   * Find user who uploaded a file
   */
  fastify.get('/:uid/:fid', {
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          fid: { type: 'string', description: 'MongoDB ObjectId of the file' },
          uid: { type: 'string', description: 'MongoDB ObjectId of the user' },
        },
      },
      response: {
        200: userSchema,
      },
    },
    async handler (request, reply) {
      const fid = fastify.toObjectId(request.params.fid);
      const uid = fastify.toObjectId(request.params.uid);
      if (!fid || !uid) return reply.code(400).send(new Error('Invalid ID'));
      const user = await Sound.findById(request.params.fileId)
        .populate('users')
        .findById(request.params.userId);
      return user;
    },
  });

  /**
   * Delete a sound file - should be Admin only or limited to the user themselves
   */
  fastify.delete('/sound/:id', {
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      response: {
        200: uploadSchema,
      },
    },
    async handler (request, reply) {
      try {
        const _id = fastify.toObjectId(request.params.id);
        if (!_id) return reply.code(400).send(new Error('Invalid ID'));
        await fastify.gridfsSounds.delete(_id);
        const file = await Sound.findByIdAndDelete(_id);
        if (file.images) {
          // delete all associated images
          for (const image of file.images) {
            await fastify.gridfsImages.delete(image);
            await Image.findByIdAndDelete(image);
          }
        }
        const users = await User.find({ uploads: file._id });

        // Remove the file ID from every user's uploads array
        for (const user of users) {
          user.uploads.pull(file._id);
          await user.save();
        }
        return file;
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });

  /**
   * Delete a image file - should be Admin only or limited to the user themselves
   */
  fastify.delete('/image/:id', {
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      response: {
        200: uploadSchema,
      },
    },
    async handler (request, reply) {
      try {
        const _id = fastify.toObjectId(request.params.id);
        if (!_id) return reply.code(400).send(new Error('Invalid ID'));

        await fastify.gridfsImages.delete(_id);
        const file = await Image.findByIdAndDelete(_id);
        const sound = await Sound.findById(file.soundFile);
        sound.images.pull(file._id);
        await sound.save();

        return file;
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });

  /**
   * Rename a file - should be Admin only or limited to the user themselves
   */
  fastify.patch('/filename/:id', {
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      body: {
        type: 'object',
        required: ['newFileName'],
        properties: {
          newFileName: { type: 'string', description: 'New file name' },
        },
      },
      response: {
        200: uploadSchema,
      },
    },
    async handler (request, reply) {
      try {
        const _id = fastify.toObjectId(request.params.id);
        if (!_id) return reply.code(400).send(new Error('Invalid ID'));
        const newFileName = request.body.newFileName;

        // Renames the file to new file name
        const file = await fastify.gridfsSounds.rename(_id, newFileName);
        return file;
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });

  /**
   * Update metadata of a file - should be Admin only or limited to the user themselves
   */
  fastify.patch('/metadata/:id', {
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'New title for the file' },
          description: { type: 'string', description: 'New description for the file' },
          tags: { type: 'array', items: { type: 'string' }, description: 'Array of tags' },
          latitude: { type: 'number', description: 'New latitude value' },
          longitude: { type: 'number', description: 'New longitude value' },
        },
      },
      response: {
        200: uploadSchema,
      },
    },
    async handler (request, reply) {
      try {
        const _id = fastify.toObjectId(request.params.id);
        if (!_id) return reply.code(400).send(new Error('Invalid ID'));

        if (!Object.keys(request.body).length) {
          throw new Error('No metadata provided');
        }

        const oldFile = await fastify.mongoose.connection.db.collection('sounds.files').findOne({ _id: _id });
        const metadata = { ...oldFile.metadata, ...request.body };
        oldFile.metadata = metadata;

        const file = await fastify.mongoose.connection.db.collection('sounds.files').findOneAndUpdate(
          { _id },
          {
            $set: {
              metadata: metadata,
            },
          },
          { returnOriginal: false }
        );

        return file;
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });
}
