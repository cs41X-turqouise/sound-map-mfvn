## Documentation
Documentation provided by [Swagger](https://github.com/fastify/fastify-swagger), view in browser at http://localhost:3000/docs/static/index.html#/

## Available Scripts

In the project directory, you can run:

### `npm run dev`

To start the app in dev mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm start`

For production mode

### `npm run test`

Run the test cases.

### `npm run lint`

Run eslint

### `npm run clean-db`

Clean all collections

### `npm run seed-db [# of users to create]`

Generate fake users to populate the database. Each user will generate  between 1 and 3 audio uploads and each of those uploads will generate between 0 and 3 image attachments

## `node node .\scripts\gen-secrets.js`

Generate secrets for the cookie, session, and mongostore enviroment variables 

## Learn More

To learn Fastify, check out the [Fastify documentation](https://www.fastify.io/docs/latest/).
