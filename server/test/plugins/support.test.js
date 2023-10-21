// 'use strict';

// const { build, close } = require('../../test/helper.js');
// const {someSupport} = require ('../../plugins/support.js')
// describe('GET /support', () => {
// let testServer;
// beforeAll(async () => {
//   testServer = await build();
//   console.log("After build (support):")
//   console.log(testServer.someSupport());
  
//   console.log(testServer.someSupport)
//   });


// describe('Support Plugin', () => {
  
//   test('support works standalone', async () => {console.log("Inside test:");
//   console.log(testServer.someSupport());

//     await expect(testServer.someSupport()).toBe('hugs');
//   });
// });
// });

const fastify = require('fastify');
const supportPlugin = require('../../plugins/support');

describe('Support Plugin Direct Test', () => {
  let testServer;

  beforeAll(async () => {
    testServer = fastify();
    await testServer.register(supportPlugin);
    await testServer.ready();
    console.log("inside support.test line 36: ")
    console.log(testServer.someSupport());
  });

  afterAll(() => {
    testServer.close();
  });

  test('support works standalone', async () => {
    expect(testServer.someSupport()).toBe('hugs');
  });
});
