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

    fastify.log.info("CSRF Protection Route registered")

}