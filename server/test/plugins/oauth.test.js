import tap from 'tap';
import fastify from 'fastify';
import oauth from '../../plugins/oauth.js';

tap.test('OAuth2 plugin', async (t) => {
  const server = fastify();
  server.register(oauth);

  // Test the initial redirection
  const response = await server.inject({
    method: 'GET',
    url: '/auth/google',
  });

  t.equal(response.statusCode, 302);
  t.ok(response.headers.location.startsWith('https://accounts.google.com/o/oauth2/v2/auth'));
});
