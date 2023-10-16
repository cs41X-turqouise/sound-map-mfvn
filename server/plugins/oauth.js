'use strict';
const fp = require('fastify-plugin');

/**
 * registers the OAuth2 configuration for Google authentication.
 */
module.exports = fp(async function (fastify, options) {
  // Register the Fastify OAuth2 plugin.
  fastify.register(require('@fastify/oauth2'), {
    name: 'googleOAuth2', // Name of the authentication strategy.
    scope: ['profile', 'email'], // The scope for the OAuth2 request. 'profile' gives access to basic profile information.
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID, // Client ID from environment variable.
        secret: process.env.GOOGLE_CLIENT_SECRET // Client Secret from environment variable.
      },
      auth: require('@fastify/oauth2').GOOGLE_CONFIGURATION // Use the predefined Google OAuth2 configuration from Fastify OAuth2 plugin.
    },
    startRedirectPath: '/auth/google', // Path to redirect user for authentication.
    callbackUri: 'http://localhost:3000/auth/google/callback' // The callback URL Google will redirect to after authentication.
  });
  fastify.decorateRequest('user', null);
}, { name: 'oauth' });
