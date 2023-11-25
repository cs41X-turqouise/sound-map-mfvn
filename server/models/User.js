/** @type {import("mongoose").Mongoose} */
import mongoose from 'mongoose';

/**
 * Mongoose schema for user accounts.
 *
 * @typedef {Object} User
 * @property {string} _id - The MongoDB ObjectId of the user.
 * @property {string} username - The username of the user.
 * @property {string} fullname - The full name of the user.
 * @property {string} email - The email address of the user.
 * @property {string} gid - The Google ID of the user.
 * @property {string} profilePhoto - The URL of the user's profile photo.
 * @property {mongoose.Schema.Types.ObjectId[]} uploads - An array of IDs of the user's uploaded files.
 * @property {mongoose.Schema.Types.ObjectId[]} bookmarks - An array of IDs of the user's bookmarked files.
 * @property {string} role - The role of the user. Can be 'user', 'moderator', or 'admin'.
 * @property {boolean} banned - Whether or not the user is banned.
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
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
  },
  uploads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sounds',
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'sounds',
  }],
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin', 'superadmin'],
    default: 'user',
    lowercase: true,
  },
  banned: {
    type: Boolean,
    default: false,
  },
  inbox: [{
    date: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      required: true,
      maxlength: 255,
    },
    message: {
      type: String,
      maxlength: 500,
    },
    read: {
      type: Boolean,
      default: false,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  }],
});

export default mongoose.model('users', userSchema);

