'use strict';

const { getTestApp } = require('../helper');

const server = getTestApp();
describe('Support Plugin', () => {
  test('should add someSupport decorator', () => {
    expect(typeof server.someSupport).toBe('function');
    expect(server.someSupport()).toBe('hugs');
  });
});
// uncomment this for it to  work:
// const fastify = require('fastify');
// const supportPlugin = require('../../plugins/support');

// describe('Support Plugin Direct Test', () => {
//   let testServer;

//   beforeAll(async () => {
//     testServer = fastify();
//     await testServer.register(supportPlugin);
//     await testServer.ready();
//     console.log("inside support.test line 36: ")
//     console.log(testServer.someSupport());
//   });

//   afterAll(() => {
//     testServer.close();
//   });

//   test('support works standalone', async () => {
//     expect(testServer.someSupport()).toBe('hugs');
//   });
// });
