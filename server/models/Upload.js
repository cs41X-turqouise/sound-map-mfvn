/** @type {import("mongoose").Mongoose} */
const mongoose = require('mongoose');

const uploadSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    default: Date.now(),
    type: Date,
  },
});

module.exports = mongoose.model('Uploads', uploadSchema);