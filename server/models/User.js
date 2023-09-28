/** @type {import("mongoose").Mongoose} */
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String, 
    required: true,
    unique: true,
  },
  uploads: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Uploads',
  }],
});

module.exports = mongoose.model('Users', userSchema);
