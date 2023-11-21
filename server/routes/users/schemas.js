/**
 * Schemas for user routes
 */

/** @type {import("fastify").FastifySchema} */
export const userSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', description: 'MongoDB ObjectId' },
    username: { type: 'string' },
    fullname: { type: 'string' },
    email: { type: 'string', format: 'email' },
    gid: { type: 'string', description: 'Google ID' },
    profilePhoto: { type: 'string', description: 'url' },
    uploads: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: 'MongoDB ObjectId' },
          user: { type: 'string', description: 'MongoDB ObjectId' },
          images: { type: 'array', items: { type: 'string', description: 'MongoDB ObjectId' } },
        },
      },
    },
    bookmarks: { type: 'array', items: { type: 'string', description: 'MongoDB ObjectId' } },
    role: { type: 'string', enum: ['user', 'moderator', 'admin'] },
    banned: { type: 'boolean' },
    inbox: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', description: 'MongoDB ObjectId' },
          date: { type: 'string', format: 'date-time' },
          title: { type: 'string' },
          message: { type: 'string' },
          read: { type: 'boolean' },
          sender: {
            type: 'object',
            properties: {
              _id: { type: 'string', description: 'MongoDB ObjectId' },
              username: { type: 'string' },
              email: { type: 'string', format: 'email' },
            }
          },
        },
      },
    },
  }
};
