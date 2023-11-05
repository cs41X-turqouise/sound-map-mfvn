/**
 * Schemas for user routes
 */

export const userSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string', description: 'MongoDB ObjectId' },
    username: { type: 'string' },
    fullname: { type: 'string' },
    email: { type: 'string', format: 'email' },
    gid: { type: 'string', description: 'Google ID' },
    uploads: { type: 'array', items: { type: 'string', description: 'MongoDB ObjectId' } },
    bookmarks: { type: 'array', items: { type: 'string', description: 'MongoDB ObjectId' } },
  }
};
