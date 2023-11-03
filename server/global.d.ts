/* eslint-ignore */
import { FastifyInstance } from 'fastify';
import { Mongoose } from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { Multer } from 'multer';

declare module 'fastify' {
  interface FastifyRequest {
    file?: Express.Multer.File;
    files?: Record<string, Express.Multer.File[]>;
  }

  interface FastifyInstance {
    mongoose: Mongoose;
    toObjectId: (id: string) => Mongoose.Types.ObjectId;
    gridfsSounds: GridFSBucket;
    gridfsImages: GridFSBucket;
    upload: Multer;
    config: {
      PORT: number;
      MONGODB_URL: string;
      JWT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
    };
  }
}