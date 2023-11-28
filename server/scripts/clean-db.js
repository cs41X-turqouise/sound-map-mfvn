import pkg from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Sound from '../models/Sound.js';
import Image from '../models/Image.js';
import Reports from '../models/Reports.js';

pkg.config({ path: './local.env' });
/**
 * Cleans the MongoDB database.
 * @async
 */
async function cleanDatabase () {
  try {
    await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
    
    // Delete all documents in the collections
    await User.deleteMany({});
    await Sound.deleteMany({});
    await Image.deleteMany({});
    await Reports.deleteMany({});
    await mongoose.connection.db.collection('sounds.files').deleteMany({});
    await mongoose.connection.db.collection('sounds.chunks').deleteMany({});
    await mongoose.connection.db.collection('images.files').deleteMany({});
    await mongoose.connection.db.collection('images.chunks').deleteMany({});
    await mongoose.connection.db.collection('sessions').deleteMany({});

    console.log('Deleted all documents');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanDatabase();
