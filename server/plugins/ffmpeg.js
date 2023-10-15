const ffmpegStatic = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');
const fp = require('fastify-plugin')

module.exports = fp(function (fastify, opts, done) {
    // load a static instance of ffmepg for fluent-ffmpeg 
    ffmpeg.setFfmpegPath(ffmpegStatic);
    // decorate the Fastify instance with the Mongoose client
    fastify.decorate('ffmpeg', ffmpeg);
    fastify.log.info('ffmpeg loaded...');
    done();
});