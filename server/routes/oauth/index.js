// server/routes/oauth/index.js

'use strict';  // Use JavaScript in "strict" mode to catch common bugs.

const sget = require('simple-get');  // Require 'simple-get' for making HTTP requests.
const jwt = require('../jwt/index.js')
/**
 * Route handlers for the Google OAuth2 callback.
 * @param {import("fastify").FastifyInstance} fastify 
 * @param {Object} options plugin options, refer to https://www.fastify.io/docs/latest/Reference/Plugins/#plugin-options
 */
module.exports = async function (fastify, options) {
  // Define a GET route for the OAuth2 callback.
  fastify.get('/login/google/callback', function (request, reply) {
    // Use the 'getAccessTokenFromAuthorizationCodeFlow' method from the Fastify OAuth2 plugin to obtain an access token.
    fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request, (err, result) => {
      if (err) {
        reply.send(err);  // Send the error as a response if there's any.
        return;
      }
      // Make a request to Google's API to get user information.
      // console.log("Access Token:", result.token.access_token);
      sget.concat({
        url: 'https://www.googleapis.com/oauth2/v2/userinfo',  // Google's endpoint for user information.
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + result.token.access_token  // Set the Authorization header with the obtained access token.
        },
        json: true  // Expect a JSON response.
      }, 
      
      function (err, res, data) {
        if (err) {
          reply.send(err);  // Send the error as a response if there's any.
          return;
        }
        token = generateToken(data);
        const redirectUrl = `http://localhost:5173/oauth/callback?token=${token}`;
        // reply.redirect(redirectUrl); // Send the user data as a response.
        res.redirect(redirectUrl);
      });
    });
  });
  fastify.log.info('Oauth Route registered.');
}
