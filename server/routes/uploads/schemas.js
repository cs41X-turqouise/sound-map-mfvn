/**
 * Schemas for upload routes
 */

export const uploadSchema = {
  type: 'object',
  properties: {
    fieldname: { type: 'string' },
    originalname: { type: 'string' },
    encoding: { type: 'string' },
    mimetype: { type: 'string' },
    id: { type: 'string' },
    filename: { type: 'string' },
    metadata: {
      type: 'object',
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
    },
    bucketName: { type: 'string' },
    chunkSize: { type: 'number' },
    size: { type: 'number' },
    uploadDate: { type: 'string', format: 'date-time' },
    contentType: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    tags: { type: 'string' },
    latitude: { type: 'string' },
    longitude: { type: 'string' },
    geodata: { type: 'string' }
  }
};
