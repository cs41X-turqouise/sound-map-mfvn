import ffmpegStatic from '@ffmpeg-installer/ffmpeg';
import ffprobeStatic from '@ffprobe-installer/ffprobe';
import ffmpeg from 'fluent-ffmpeg';

import fp from 'fastify-plugin';

export default fp(function (fastify, opts, done) {
  // load a static instance of ffmepg for fluent-ffmpeg
  ffmpeg.setFfmpegPath(ffmpegStatic.path);
  ffmpeg.setFfprobePath(ffprobeStatic.path);
  // decorate the Fastify instance with the Mongoose client
  fastify.decorate('ffmpeg', ffmpeg);
  fastify.decorate('ffmpegStatic', ffmpegStatic);
  fastify.log.info('ffmpeg loaded...');
  fastify.log.info(`ffmpeg version ${ffmpegStatic.version}`);
  fastify.log.info(`ffmpeg url ${ffmpegStatic.url}`);
  fastify.log.info(`ffmpeg path ${ffmpegStatic.path}`);
  fastify.log.info(`ffmpeg path type ${typeof ffmpegStatic.path}`);
  fastify.log.info(`ffprobe version ${ffprobeStatic.version}`);
  done();
});
