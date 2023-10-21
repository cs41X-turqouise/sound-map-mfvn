'use strict';

const { getTestApp } = require('../helper');


describe('GET /example', () => {
  test('should return the correct message', async () => {
    const testServer = getTestApp();
    const response = await testServer.inject({
      method: 'GET',
      url: '/example'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('this is an example');
  });
});
