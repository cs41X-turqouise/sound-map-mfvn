import User from '../../models/User.js';
import Sound from '../../models/Sound.js';
import Image from '../../models/Image.js';
import Reports from '../../models/Reports.js';
import { uploadSchema } from './schemas.js';
import { verifyLoggedIn, verifyNotBanned, checkUserRole } from '../../utils/utils.js';

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
        verifyLoggedIn,
        verifyNotBanned,
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
          201: {
            type: 'object',
            properties: {
              ...uploadSchema.properties,
              images: {
                type: 'array',
                items: { type: 'string', description: 'MongoDB ObjectId' }
              },
            },
          },
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
        const user = await User.findById(userId).exec();
        user.uploads.push(upload._id);

        await user.save();
        await upload.save();
        sound.images = images;
        sound._id = upload._id;

        return reply.code(201).send(sound);
      }
    }
  );

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
   * Get a specific audio upload
   */
  fastify.get('/:id', {
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
    },
  }, async function (request, reply) {
    const _id = fastify.toObjectId(request.params.id);
    if (!_id) return reply.code(400).send(new Error('Invalid ID'));
    const fileDoc = await Sound.findById(_id).exec();
    const { file, fileStream } = await fileDoc.getFileStream(fastify);
    reply.header('Content-Type', file.contentType);
    return reply.send(fileStream);
  });

  /**
   * Get a specific image upload
   */
  fastify.get('/image/:id', {
    schema: {
      tags: ['uploads'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'MongoDB ObjectId' },
        },
      },
    },
  }, async function (request, reply) {
    const _id = fastify.toObjectId(request.params.id);
    if (!_id) return reply.code(400).send(new Error('Invalid ID'));
    const fileDoc = await Image.findById(_id).exec();
    const { file, fileStream } = await fileDoc.getFileStream(fastify);
    reply.header('Content-Type', file.contentType);
    return reply.send(fileStream);
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
          items: {
            type: 'object',
            properties: {
              ...uploadSchema.properties,
              images: {
                type: 'array',
                items: { type: 'string', description: 'MongoDB ObjectId' }
              },
            },
          },
        },
      },
    },
    async handler (request, reply) {
      const data = [];
      const uploads = await Sound.find({});
      for (const upload of uploads) {
        try {
          const file = await upload.getFile(fastify);
          file.images = upload.images || [];

          if (file.metadata.creator) {
            const creator = fastify.toObjectId(file.metadata.creator);
            file.metadata.creator = await User.findById(creator, 'username').exec();
          } else {
            file.metadata.creator = { username: 'Unknown' };
          }
          data.push(file);
        } catch (err) {
          // should we remove the file if its not found in the bucket?
          fastify.log.error(err);
          fastify.log.error(upload);
        }
      }
      return reply.send(data);
    },
  });

  /**
   * Delete a sound file - should be Admin only or limited to the user themselves
   */
  fastify.delete('/sound/:id', {
    preHandler: checkUserRole('moderator', true),
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

        // Delete any reports associated with the file - todo: notify the reporter that the file has been deleted
        await Reports.deleteMany({ fileId: file._id });

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
    preHandler: checkUserRole('moderator', true),
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
    preHandler: checkUserRole('moderator', true),
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
    preHandler: checkUserRole('moderator', true),
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
          { returnDocument: 'after', returnNewDocument: true }
        );
        fastify.log.info(file);

        return file.value;
      } catch (err) {
        fastify.log.error(err);
        throw new Error('Internal Server Error');
      }
    },
  });
}
