'use strict';

const { test } = require('tap');
const { build } = require('../helper');

test('example is loaded', async (t) => {
  const app = await build(t);
  try {
    const res = await app.inject({
      url: '/example'
    });
    t.equal(res.payload, 'this is an example');
  } catch (error) {
    console.error('Error during test:', error);
    t.fail('Test failed due to an error.');
  }
});

// inject callback style:
//
// test('example is loaded', (t) => {
//   t.plan(2)
//   const app = await build(t)
//
//   app.inject({
//     url: '/example'
//   }, (err, res) => {
//     t.error(err)
//     t.equal(res.payload, 'this is an example')
//   })
// })
