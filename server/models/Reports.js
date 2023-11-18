/** @type {import("mongoose").Mongoose} */
import mongoose from 'mongoose';

/**
 * Mongoose schema for reported content messages.
 *
 * @typedef {Object} Report
 * @property {string} _id - The MongoDB ObjectId of the document.
 * @property {mongoose.Schema.Types.ObjectId} reporter - The MongoDB ObjectId of the user who created the report.
 * @property {mongoose.Schema.Types.ObjectId} fileId - The MongoDB ObjectId of the upload being reported.
 * @property {string} reason - The reason for the report.
 * @property {Date} date - The date the report was created.
 */
const reportSchema = new mongoose.Schema({
  reporter: {
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
  date: {
    type: Date,
    default: Date.now,
  },
});

/**
 * @todo Feel like we need some input sanitization here before we save to the database.
 */

export default mongoose.model('reports', reportSchema);
