/* eslint-ignore */
import { FastifyInstance } from 'fastify';
import { Mongoose } from 'mongoose';
import { GridFSBucket } from 'mongodb';

declare module 'fastify' {
  interface FastifyInstance {
    mongoose: Mongoose;
    toObjectId: (id: string) => Mongoose.Types.ObjectId;
    gridfsSounds: GridFSBucket;
    gridfsImages: GridFSBucket;
    upload: any;
  }
}
declare module '../app';