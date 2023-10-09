/** @type {import("mongoose").Mongoose} */
const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
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