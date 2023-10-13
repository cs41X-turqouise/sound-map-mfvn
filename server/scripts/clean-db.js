require('dotenv').config({ path: './local.env' });
const mongoose = require('mongoose');

async function cleanDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    const User = require('../models/User');
    const Sound = require('../models/Sound');
    const Image = require('../models/Image');

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