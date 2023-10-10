// server/plugins/auth.js

'use strict';  // Use JavaScript in "strict" mode to catch common bugs.
const fp = require('fastify-plugin');

/**
 * registers the OAuth2 configuration for Google authentication.
 */
module.exports = fp(async function (fastify, options) {
  // Register the Fastify OAuth2 plugin.
  fastify.register(require('@fastify/oauth2'), {
    name: 'googleOAuth2',   // Name of the authentication strategy.
    scope: ['profile'],     // The scope for the OAuth2 request. 'profile' gives access to basic profile information.
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID,             // Client ID from environment variable.
        secret: process.env.GOOGLE_CLIENT_SECRET      // Client Secret from environment variable.
      },
      auth: require('@fastify/oauth2').GOOGLE_CONFIGURATION   // Use the predefined Google OAuth2 configuration from Fastify OAuth2 plugin.
    },
    startRedirectPath: '/login/google',                      // Path to redirect user for authentication.
    callbackUri: 'http://localhost:5173/oauth/callback'  // The callback URL Google will redirect to after authentication.
  })
}, { name: 'oauth2' });