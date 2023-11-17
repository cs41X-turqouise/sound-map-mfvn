/* eslint-ignore */
import { FastifyInstance, HookHandlerDoneFunction } from 'fastify';
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
    /** Workaround because `fastify.crsfProtection still isn't working */
    csrfCheck: (req: FastifyRequest, res: FastifyReply, next: HookHandlerDoneFunction) => void;
    config: {
      PORT: number;
      MONGODB_URL: string;
      JWT_SECRET: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
    };
  }
}