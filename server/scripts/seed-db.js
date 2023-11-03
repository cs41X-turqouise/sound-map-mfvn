import pkg from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Sound from '../models/Sound.js';
import Image from '../models/Image.js';
import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

pkg.config({ path: './local.env' });
/**
 * Populate the MongoDB database with mock data.
 * @async
 */
async function populateDB () {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const soundBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'sounds'
    });
    const imageBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'images'
    });
  
    for (let i = 0; i < 10; i++) {
      // Create a new user
      const gid = faker.string.numeric({ length: { min: 10, max: 30 } });
      const fullname = faker.person.fullName();
      const email = faker.internet.email();
      const user = new User({
        gid,
        fullname,
        username: fullname,
        email,
        profilePhoto: faker.image.avatar(),
      });
  
      // Create mock file upload for the user
      const upload = fs.createReadStream(path.resolve(__dirname, '..', 'test/mock_data/waves-crashing.wav'))
        .pipe(soundBucket.openUploadStream(`${faker.string.numeric({ length: { min: 5, max: 10 } })}_waves-crashing`, {
          metadata: {
            title: faker.lorem.lines(1),
            description: faker.lorem.paragraph({ min: 1, max: 3 }),
            tags: faker.lorem.words({ min: 3, max: 5 }).split(' '),
            lattitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
            geodata: null,
          }
        }));
      await new Promise((resolve, reject) => {
        upload.on('error', reject);
        upload.on('finish', resolve);
      });
      const sound = new Sound({
        user: user._id,
        images: [],
        _id: upload.id,
      });
      await sound.save();
      user.uploads.push(sound._id);
      await user.save();
    }
  
    console.log('Database populated');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

populateDB().catch(console.error);
