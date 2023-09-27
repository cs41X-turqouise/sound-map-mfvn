'use strict'

const fp = require('fastify-plugin')
const OAuth2 = require('@fastify/oauth2')
const Cookie = require('@fastify/cookie')

module.exports = fp(async function (fastify, options) {
  // fastify.register(OAuth2, {
  //   name: 'googleOAuth2',
  //   scope: ['email', 'profile'],
  //   credentials: {
  //     client: {
  //       id: fastify.config.GOOGLE_CLIENT_ID,
  //       secret: fastify.config.GOOGLE_CLIENT_SECRET
  //     },
  //     auth: OAuth2.GOOGLE_CONFIGURATION
  //   },
  //   startRedirectPath: '/login/google',
  //   callbackUri: fastify.config.GOOGLE_CALLBACK_URL
  // })

  // fastify.register(Cookie, {
  //   secret: fastify.config.COOKIE_SECRET
  // })
}, { name: 'auth' });