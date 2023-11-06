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

      uploadCompressedFile(sound, fastify, options);
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
/**
 * Generate compressed sound
 * @param {*} sound the sound to be compressed
 * @param {*} fastify fastify instance
 * @param {*} options fastify options
 */
async function uploadCompressedFile (sound, fastify, options) {
  const { fileStream } = await sound.getFileStream(fastify);
  const outStream = await fastify.gridfsSounds.openUploadStream('compressed.mp3');
  outStream.on('finish', async () => {
    fastify.log.info(`SUCCESSFUL upload to MongoDB`);
    fastify.log.info(
      `Attaching compressed sound file ${outStream.id}\n`,
      `\tto MongoDB Sound ${sound.id}`);
    
    sound.compressed.push(outStream.id);
    await sound.save();
  });
  
  const command
      = fastify.ffmpeg(fileStream)
        .inputFormat('mp3')
        .audioBitrate(96);
      
  command
    .on('start', (cmdline) => fastify.log.info(cmdline))
    .on('error', (err) => fastify.log.error(err))
    .on('end', () => {
      fastify.log.info('ffmpeg command succesful');
    } );


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
      fastify.log.info(`deleting temp file at: \n\t${tempFilePath}`);
      fs.unlink(tempFilePath, (err) => {
        if (err) return fastify.log.error(err);
        fastify.log.info('file deleted successfully');
      });
    });
  } else {
    command
      .output(outStream)
      .outputFormat('mp3');
    fastify.log.info(`outputting to MongoDB upload stream...`);
  }
    
  await command.run();
}
