
'use strict'

const {Readable} = require('stream')
const {Buffer} = require('node:buffer')
const path = require("path");
const fs = require("fs");
const fastifyAutoload = require('@fastify/autoload');


const { platform } = process;
const locale = path[platform === `win32` ? `win32` : `posix`];
/**
 * 
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
    

    /** @type {import("fluent-ffmpeg")} */
    const ffmpeg = fastify.ffmpeg

    fastify.post('/', { preHandler: fastify.upload.single('sound') },
        async function (request, reply) {
            const data =  request.file
            fastify.log.info(`request.file.buffer is ${!Buffer.isBuffer(data.buffer) ? 'not' : ''} a Buffer`)
            fastify.log.info(`request.file.buffer ->  ${data.buffer }`)
            const stream = new Readable();
            stream._read = () => {}
             stream.push(data.buffer)
             stream.push(null)


            fastify.log.info(`file in MongoDB as ${data.filename}`)
            
            /**
             * @todo rewrite this so it takes MongoDB id as URL param
             * @todo have the main upload route call this route
             * @todo auto detect file types for images/audio 
             * @todo use buffer streams from MongoDB to read and write
             */
            return;
            var command = 
            ffmpeg(stream)
            //.inputFormat('mp3')
            .audioBitrate(96)
            .output(newFilePath)
            .outputFormat('mp3')
        
            fastify.log.info(`outputting to ${newFilePath}`)
            
            command.on('start', (cmdline) => fastify.log.info(cmdline))
                .on('error', (err) => fastify.log.error(err))
                .on('end', () => fastify.log.info('ffmpeg command succesful'))

            command.run()
            
            
        })


    fastify.post('/local', { preHandler: fastify.upload_local.single('sound') },
        async function (request, reply) {
            const data =  request.file
            //fastify.log.info(`request.file.buffer is ${!Buffer.isBuffer(data.buffer) ? 'not' : ''} a Buffer`)
            // fastify.log.info(`request.file.buffer ->  ${data.buffer }`)
            // const stream = new Readable();
            // stream._read = () => {}
            //  stream.push(data.buffer)
            //  stream.push(null)
            fastify.log.info(`request.file is ${data}`)
            const originalFilePath = data.path
            var dirName = path.dirname(originalFilePath) + locale.sep
            var fileName = path.basename(originalFilePath, path.extname(originalFilePath))
            var newFileName = fileName + '-compressed' + path.extname(originalFilePath)
            
            var newFilePath = dirName + newFileName
            
            fastify.log.info(`trying to compress ${originalFilePath}`)
            var command = 
            ffmpeg(data.path)
            //.inputFormat('mp3')
            .audioBitrate(96)
            .output(newFilePath)
            .outputFormat('mp3')
        
            fastify.log.info(`outputting to ${newFilePath}`)
            
            command.on('start', (cmdline) => fastify.log.info(cmdline))
                .on('error', (err) => fastify.log.error(err))
                .on('end', () => fastify.log.info('ffmpeg command succesful'))

            command.run()
            
            
        })
}