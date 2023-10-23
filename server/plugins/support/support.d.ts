declare function supportPlugin(fastify: any, opts: any): void;
export = supportPlugin;
declare module 'fastify' {
    export interface FastifyInstance {
      someSupport: () => string;
    }
  }
  