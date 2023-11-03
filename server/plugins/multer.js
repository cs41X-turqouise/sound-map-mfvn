import fp from 'fastify-plugin';
import multer from 'fastify-multer';
import { GridFsStorage } from '@thebguy/multer-gridfs-storage';

export default fp(async function (fastify, options) {
  fastify.register(multer.contentParser);

  const storage = new GridFsStorage({
    url: fastify.config.MONGODB_URL,
    /**
     * @param {Request} req
     * @param {import("@thebguy/multer-gridfs-storage").GridFile} file
     */
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        const filename = `${Date.now()}_${file.originalname}`;
        const isAudio = file.mimetype.match(/^audio\//);
        const fileInfo = {
          filename: filename,
          originalname: file.originalname,
          bucketName: (isAudio ? 'sounds' : 'images')
        };
        if (isAudio) {
          fileInfo.metadata = {
            ...req.body,
          };
          // have to manually convert tags from string to array - why??
          if (!Array.isArray(fileInfo.metadata.tags)) {
            fileInfo.metadata.tags = fileInfo.metadata.tags
              ? fileInfo.metadata.tags.split(',')
              : [];
          }
        }
        resolve(fileInfo);
      });
    }
  });

  storage.on('connection', (db) => {
    // Db is the database instance
    fastify.log.info('GRIDFS connection established!');
  });

  // Decorate the Fastify instance
  fastify.decorate('upload', multer({ storage: storage }));
});
