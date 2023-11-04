import tap from 'tap';
import fastify from 'fastify';
import cors from '../../plugins/cors.js';

tap.test('CORS plugin', async (t) => {
  const server = fastify();
  server.register(cors);

  server.get('/', async (request, reply) => {
    return { hello: 'world' };
  });

  const response = await server.inject({
    method: 'GET',
    url: '/',
    headers: {
      Origin: 'http://example.com',
    },
  });

  t.equal(response.headers['access-control-allow-origin'], 'http://example.com');
  t.equal(response.headers['access-control-allow-credentials'], 'true');
});
