'use strict';
const { getTestApp } = require('../helper');

describe('Root route', () => {
  test('should return Hello World', async () => {
    const testServer = getTestApp();
    const response = await testServer.inject({
      method: 'GET',
      url: '/'
    });

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.payload)).toEqual({ root: 'Hello World' });
  });
});
