/**
 * Schemas for report routes
 */

/** @type {import("fastify").FastifySchema} */
export const reportSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', description: 'MongoDB ObjectId' },
    reporter: { type: 'string', description: 'MongoDB ObjectId' },
    fileId: { type: 'string', description: 'MongoDB ObjectId' },
    reason: {
      type: 'string',
      description: 'Reason for reporting the file',
      minLength: 1,
      maxLength: 1000,
    },
    date: { type: 'string', format: 'date-time' },
  },
};
