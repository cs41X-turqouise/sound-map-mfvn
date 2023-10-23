'use strict'

module.exports = async function (fastify, options) {

    // Generate a token
    fastify.route({
        method: 'GET',
        path: '/',
        handler: async (req, reply) => {
            const token = await reply.generateCsrf()
            return { token }
        }
    })

    // Protect a route
    fastify.route({
        method: 'POST',
        path: '/',
        onRequest: fastify.csrfProtection,
        handler: async (req, reply) => {
            const token = await reply.generateCsrf()
            reply.type('text/html')
            return `
            <html>
              <script type='text/javascript'>
                async function test(event) {
                  event.preventDefault()
                  const rawResponse = await fetch('/', {
                    method: 'POST',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ _csrf: '${token}'})
                  });
                  const content = await rawResponse.json();
                  
                  alert(JSON.stringify(content));
                }
              </script>
              <body>
                <form action="/" method='POST' id='form' onsubmit={test(event)}>
                  <input type='submit' value='submit' />
                </form>
              </body>
            </html>
          
          `
        }
    })

    // Define a Fastify plugin for CSRF protection.
    async function fastifyCsrfProtection (fastify, options) {
        // Destructure options and set default values where needed.
        const {
          sessionKey,
          getToken,
          getUserInfo,
          sessionPlugin
        } = Object.assign({}, defaultOptions, opts)
      
        // Get CSRF-specific options if provided, or use an empty object.
        const csrfOpts = opts && opts.csrfOpts ? opts.csrfOpts : {}
      
        // Assert that the required options have the correct types.
        assert(typeof sessionKey === 'string', 'sessionKey should be a string')
        assert(typeof getToken === 'function', 'getToken should be a function')
        assert(typeof getUserInfo === 'function', 'getUserInfo should be a function')
        assert(
          ['@fastify/cookie', '@fastify/session', '@fastify/secure-session'].includes(sessionPlugin),
          "sessionPlugin should be one of the following: '@fastify/cookie', '@fastify/session', '@fastify/secure-session'"
        )
      
        // If getUserInfo is provided in options, enable userInfo in CSRF options.
        if (opts.getUserInfo) {
          csrfOpts.userInfo = true
        }
      
        // Create a new instance of the CSRF class with the provided or default options.
        const tokens = new CSRF(csrfOpts)
      
        // Decorate the Fastify reply object with a function to generate CSRF tokens.
        if (sessionPlugin === '@fastify/secure-session') {
          fastify.decorateReply('generateCsrf', generateCsrfSecureSession)
        } else if (sessionPlugin === '@fastify/session') {
          fastify.decorateReply('generateCsrf', generateCsrfSession)
        } 
      
        // Decorate the Fastify instance with a function for CSRF protection.
        fastify.decorate('csrfProtection', csrfProtection)
      

        let getSecret
      
        // Define a function to retrieve the CSRF secret based on the session plugin.
        if (sessionPlugin === '@fastify/secure-session') {
          getSecret = function getSecret (req, reply) { return req.session.get(sessionKey) }
        } else if (sessionPlugin === '@fastify/session') {
          getSecret = function getSecret (req, reply) { return req.session[sessionKey] }
        } 
      
      
        // Define a function to generate CSRF tokens for secure sessions.
        function generateCsrfSecureSession (opts) {
          let secret = this.request.session.get(sessionKey)
          if (!secret) {
            secret = tokens.secretSync()
            this.request.session.set(sessionKey, secret)
          }
          const userInfo = opts ? opts.userInfo : undefined
          if (opts) {
            this.request.session.options(opts)
          }
          return tokens.create(secret, userInfo)
        }
      
        // Define a function to generate CSRF tokens for sessions.
        function generateCsrfSession (opts) {
          let secret = this.request.session[sessionKey]
          const userInfo = opts ? opts.userInfo : undefined
          if (!secret) {
            secret = tokens.secretSync()
            this.request.session[sessionKey] = secret
          }
          return tokens.create(secret, userInfo)
        }
      
        // Define the CSRF protection middleware function.
        function csrfProtection (req, reply, next) {
          const secret = getSecret(req, reply)
          if (!secret) {
            req.log.warn('Missing csrf secret')
            return reply.send(new MissingCSRFSecretError())
          }
          if (!tokens.verify(secret, getToken(req), getUserInfo(req))) {
            req.log.warn('Invalid csrf token')
            return reply.send(new InvalidCSRFTokenError())
          }
          next()
        }
      }
      

    fastify.log.info("CSRF Protection Route registered.")

}