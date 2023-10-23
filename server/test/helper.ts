import Fastify from 'fastify'
import fp from 'fastify-plugin'
const App: any = require('../app.js');

async function config() {
  return {}
}

function build() {
  const app = Fastify();
  void app.register(fp(App), config()); 
  return app;
}

export {
  config,
  build
}
