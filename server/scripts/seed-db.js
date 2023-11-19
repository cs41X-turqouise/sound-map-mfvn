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
const numUsers = process.argv[2] || 10;

/**
 * Generate a random integer between min and max.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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
  
    for (let i = 0; i < numUsers; i++) {
      // Create a new user
      const gid = faker.string.numeric({ length: { min: 10, max: 30 } });
      // const fullname = faker.person.fullName();
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const username = faker.internet.userName({ firstName, lastName });
      const email = faker.internet.email({ firstName, lastName });
      const user = new User({
        gid,
        fullname: firstName + ' ' + lastName,
        username: username,
        email,
        profilePhoto: faker.image.avatar(),
      });

      const amountOfSounds = getRandomInt(1, 3);
  
      for (let j = 0; j < amountOfSounds; j++) {
        const images = [];
        const amountOfImages = getRandomInt(0, 3);
        
        // Create mock file upload for the user
        const upload = fs.createReadStream(path.resolve(__dirname, '..', 'test/mock_data/waves-crashing.wav'))
          .pipe(soundBucket.openUploadStream(`${faker.string.numeric({ length: { min: 5, max: 10 } })}_waves-crashing.wav`, {
            contentType: 'audio/wav',
            metadata: {
              title: faker.lorem.lines(1),
              description: faker.lorem.paragraph({ min: 1, max: 3 }),
              tags: faker.lorem.words({ min: 3, max: 5 }).split(' '),
              latitude: faker.location.latitude().toString(),
              longitude: faker.location.longitude().toString(),
              // todo - mock geodata
              geodata: null,
            }
          }));
        await new Promise((resolve, reject) => {
          upload.on('error', reject);
          upload.on('finish', resolve);
        });

        // Create mock images for the sound
        for (let k = 0; k < amountOfImages; k++) {
          const imgUpload = fs.createReadStream(path.resolve(__dirname, '..', 'test/mock_data/landscape.png'))
            .pipe(imageBucket.openUploadStream(`${faker.string.numeric({ length: { min: 5, max: 10 } })}_landscape.png`, {
              contentType: 'image/png',
              metadata: {}
            }));
          await new Promise((resolve, reject) => {
            imgUpload.on('error', reject);
            imgUpload.on('finish', resolve);
          });
          const image = new Image({
            user: user._id,
            soundFile: upload.id,
            _id: imgUpload.id,
          });
          await image.save();
          images.push(image._id);
        }

        const sound = new Sound({
          user: user._id,
          images: images,
          _id: upload.id,
        });
        await sound.save();
        user.uploads.push(sound._id);
      }
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
