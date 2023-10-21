'use strict';

const { build, close } = require('../helper');


describe('GET /example', () => {
  let testServer;

  beforeAll(async () => {
    testServer = await build();
  });
  afterAll(async () => {
    await close();
  });
    
  test('should return the correct message', async () => {
    const response = await testServer.inject({
      method: 'GET',
      url: '/example'
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('this is an example');
  });
});
