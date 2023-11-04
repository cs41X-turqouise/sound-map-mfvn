/**
 * Schemas for upload routes
 */

/** @type {import("fastify").FastifySchema} */
export const metadataSchema = {
  type: 'object',
  nullable: true,
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    tags: {
      type: 'array',
      items: { type: 'string' }
    },
    latitude: { type: 'string' },
    longitude: { type: 'string' },
    geodata: { type: 'string' }
  }
};

/** @type {import("fastify").FastifySchema} */
export const uploadSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', description: 'MongoDB ObjectId' },
    length: { type: 'number' },
    chunkSize: { type: 'number' },
    uploadDate: { type: 'string', format: 'date-time' },
    filename: { type: 'string' },
    contentType: { type: 'string' },
    metadata: metadataSchema,
  }
};
