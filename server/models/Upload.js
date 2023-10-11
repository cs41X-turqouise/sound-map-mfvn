/** @type {import("mongoose").Mongoose} */
const mongoose = require('mongoose');
/**
 * Mongoose schema for file uploads.
 *
 * @typedef {import("mongoose").Model} Upload
 * @property {string} filename - The name of the uploaded file designated by multer.
 * @property {string} originalname - The original name of the uploaded file.
 * @property {string} mimetype - The MIME type of the uploaded file.
 * @property {Date} uploadDate - The date the file was uploaded.
 * @property {mongoose.Schema.Types.ObjectId} user - The ID of the user who uploaded the file.
 * @property {number} size - The size of the uploaded file in bytes.
 */
const uploadSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true,
  },
  filename: {
    type: String,
    required: true,
  },
  originalname: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  uploadDate: {
    default: Date.now(),
    type: Date,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  size: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model('Uploads', uploadSchema);