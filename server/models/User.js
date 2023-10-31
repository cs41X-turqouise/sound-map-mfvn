/** @type {import("mongoose").Mongoose} */
import mongoose from 'mongoose';

/**
 * Mongoose schema for user accounts.
 *
 * @typedef {Object} User
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {mongoose.Schema.Types.ObjectId[]} uploads - An array of IDs of the user's uploaded files.
 * @property {mongoose.Schema.Types.ObjectId[]} bookmarks - An array of IDs of the user's bookmarked files.
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gid: {
    type: String,
    required: true,
    unique: true,
  },
  profilePhoto: {
    type: String,
    unique: true,
  },
  uploads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sounds',
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sounds',
  }],
});
export default mongoose.model('users', userSchema);
