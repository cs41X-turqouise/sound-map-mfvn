/** @type {import("mongoose").Mongoose} */
import mongoose from 'mongoose';

/**
 * Mongoose schema for reported content messages.
 *
 * @typedef {Object} Report
 * @property {string} _id - The MongoDB ObjectId of the document.
 * @property {mongoose.Schema.Types.ObjectId} userId - The MongoDB ObjectId of the user who created the report.
 * @property {mongoose.Schema.Types.ObjectId} fileId - The MongoDB ObjectId of the upload being reported.
 * @property {string} reason - The reason for the report.
 */
const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  reason: {
    type: String,
    required: true,
    minLength: 1,
    maxLength: 1000,
    trim: true,
  },
});

/**
 * @todo Feel like we need some input sanitization here before we save to the database.
 */

export default mongoose.model('reports', reportSchema);
