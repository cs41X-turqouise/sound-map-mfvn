const fastify = require('fastify')({ logger: { level: 'trace' } })
const oauthPlugin = require('@fastify/oauth2')

fastify.register(oauthPlugin, {
  name: 'googleOAuth2',
  credentials: {
    client: {
      id: fastify.config.GOOGLE_CLIENT_ID,
      secret: fastify.config.GOOGLE_CLIENT_SECRET
    },
    auth: oauthPlugin.GOOGLE_CONFIGURATIO
  },
  // register a fastify url to start the redirect flow
  startRedirectPath: '/login/google',
  // google redirect here after the user login
  callbackUri: 'http://localhost:3000/login/google/callback'
})

fastify.get('/login/google/callback', async function (request, reply) {
  const { token } = await this.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request)

  console.log(token.access_token)

  // if later you need to refresh the token you can use
  // const { token: newToken } = await this.getNewAccessTokenUsingRefreshToken(token)

  reply.send({ access_token: token.access_token })
})