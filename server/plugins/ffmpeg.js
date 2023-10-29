const ffmpegStatic = require('@ffmpeg-installer/ffmpeg');
const ffprobeStatic = require('@ffprobe-installer/ffprobe');
const ffmpeg = require('fluent-ffmpeg');

const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, done) {
    // load a static instance of ffmepg for fluent-ffmpeg 
    ffmpeg.setFfmpegPath(ffmpegStatic.path);
    ffmpeg.setFfprobePath(ffprobeStatic.path);
    // decorate the Fastify instance with the Mongoose client
    fastify.decorate('ffmpeg', ffmpeg);
    fastify.log.info('ffmpeg loaded...');
    fastify.log.info(`ffmpeg version ${ffmpegStatic.version}`)
    fastify.log.info(`ffprobe version ${ffprobeStatic.version}`)
    done();
});