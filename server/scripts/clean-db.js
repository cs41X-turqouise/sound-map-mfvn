 require('dotenv').config({ path: './local.env' });

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Sound from '../models/Sound.js';
import Image from '../models/Image.js';
/**
 * Cleans the MongoDB database.
 * @async
 */
async function cleanDatabase () {
  try {
    await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    
      const soundBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'sounds'
    });
    const imageBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images'
    });

    // Delete all documents in the collections
    await User.deleteMany({});
    await Sound.deleteMany({});
    await Image.deleteMany({});
    await soundBucket.drop();
    await imageBucket.drop();

    console.log('Deleted all documents');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanDatabase();
