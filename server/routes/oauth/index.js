// server/routes/oauth/index.js

'use strict';  // Use JavaScript in "strict" mode to catch common bugs.

const sget = require('simple-get');  // Require 'simple-get' for making HTTP requests.
console.log('registering Oauth Route...');
// Define the route handlers for the Google OAuth2 callback.
module.exports = function (fastify, opts, next) {
// console.log("fastify.googleOAuth2");
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
                const redirectUrl = `http://localhost:5173/oauth/callback?name=${data.name}&id=${data.id}&picture=${data.picture}`;
                reply.redirect(redirectUrl); // Send the user data as a response.
                console.log('fastasdfkjashdfkjasdhfk\nasdasdsdasify.googleOAuth2');

            });
        });
    });

    next();  // Continue to the next registered plugin or route.
}
