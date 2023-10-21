'use strict';
const { build, close } = require('../helper');

let server;

beforeAll(async () => {
  server = await build();
});

afterAll(async () => {
  await close();
});

describe('Root route', () => {
  test('should return Hello World', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ root: 'Hello World' });
  });
});
