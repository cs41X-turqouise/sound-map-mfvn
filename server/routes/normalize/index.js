import { Buffer } from 'node:buffer';
import path from 'path';

const { platform } = process;
const locale = path[platform === `win32` ? `win32` : `posix`];
import Sound from '../../models/Sound.js';
import crypto from 'crypto';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
/**
 *
 * @param {import("fastify").FastifyInstance} fastify
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
export default async function (fastify, options) {
  /** @type {import("fluent-ffmpeg")} */
  const ffmpeg = fastify.ffmpeg;

  fastify.post('/:id',
    async function (request, reply) {
      const _id = fastify.toObjectId(request.params.id);
      const sound = await Sound.findById(_id);
      const { fileStream } = await sound.getFileStream(fastify);

      const outStream = await fastify.gridfsSounds.openUploadStream('compressed.mp3');
      outStream.on('finish', () => {
        console.log(`SUCCESSFUL upload to MongoDB`);
      });
    
      const command
            = ffmpeg(fileStream)
              .inputFormat('mp3')
              .audioBitrate(96);
        
      command
        .on('start', (cmdline) => fastify.log.info(cmdline))
        .on('error', (err) => fastify.log.error(err))
        .on('end', () => fastify.log.info('ffmpeg command succesful') );


      if (fastify.ffmpegStatic.path.includes('linux')) {
        fastify.log.info('Dumb linux workaround...');
        const dir = dirname(dirname(fileURLToPath(import.meta.url)))
          .replace('routes', 'uploads');
        const tempId = crypto.randomBytes(16).toString('hex');
        const tempFilename = tempId + '.mp3';
        const tempFilePath = dir + '/' + tempFilename;
        fastify.log.info(`uploading compressed file to ${tempFilePath}...`);
        command
          .output(tempFilePath)
          .outputFormat('mp3');

        command.on('end', () => {
          const tempFileStream = fs.createReadStream(tempFilePath);
          tempFileStream.pipe(outStream);
        });
        outStream.on('finish', () => {
          //fastify.log.info(`deleting temp file at: \n\t${tempFilePath}`);
        });

        await command.run();
      } else {
        command
          .output(outStream)
          .outputFormat('mp3');
        fastify.log.info(`outputting to ${outStream}`);
            
        await command.run();
      }
    });


  fastify.post('/local', { preHandler: fastify.uploadLocal.single('sound') },
    async function (request, reply) {
      const data = request.file;
      // fastify.log.info(`request.file.buffer is ${!Buffer.isBuffer(data.buffer) ? 'not' : ''} a Buffer`)
      // fastify.log.info(`request.file.buffer ->  ${data.buffer }`)
      // const stream = new Readable();
      // stream._read = () => {}
      //  stream.push(data.buffer)
      //  stream.push(null)
      fastify.log.info(`request.file is ${data}`);
      const originalFilePath = data.path;
      const dirName = path.dirname(originalFilePath) + locale.sep;
      const fileName = path.basename(originalFilePath, path.extname(originalFilePath));
      const newFileName = fileName + '-compressed' + path.extname(originalFilePath);
            
      const newFilePath = dirName + newFileName;
            
      fastify.log.info(`trying to compress ${originalFilePath}`);
      const command
            = ffmpeg(data.path)
            // .inputFormat('mp3')
              .audioBitrate(96)
              .output(newFilePath)
              .outputFormat('mp3');
        
      fastify.log.info(`outputting to ${newFilePath}`);
            
      command.on('start', (cmdline) => fastify.log.info(cmdline))
        .on('error', (err) => fastify.log.error(err))
        .on('end', () => fastify.log.info('ffmpeg command succesful'));

      command.run();
    });
}
